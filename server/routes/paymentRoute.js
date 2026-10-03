const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Prescription = require("../models/prescription.js");
const userAuth = require("./middlewares/userAuth.js"); // adjust path to match your other routes

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --------------------------------------------------
// POST /payment/create-order
// --------------------------------------------------
router.post("/payment/create-order", userAuth, async (req, res) => {
    try {
        const { prescriptionId } = req.body;

        if (!prescriptionId) {
            return res.status(400).json({ success: false, message: "prescriptionId is required" });
        }

        const prescription = await Prescription.findById(prescriptionId)
            .populate({ path: "prescribedMed.medicineId" });

        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        // Calculate total (in rupees first, then convert to paise)
        let total = 200; // base visitation fee — match your old PayPal logic
        (prescription.prescribedMed || []).forEach((med) => {
            if (med.medicineId?.price) {
                total += med.medicineId.price * med.qty;
            }
        });

        const amountInPaise = Math.round(total * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${prescriptionId}`,
            notes: { prescriptionId: String(prescriptionId) },
        });

        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message,
        });
    }
});

// --------------------------------------------------
// POST /payment/verify-payment
// --------------------------------------------------
router.post("/payment/verify-payment", userAuth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            prescriptionId,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment fields" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            console.warn("Signature mismatch for order", razorpay_order_id);
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Signature valid — mark prescription as paid
        await Prescription.findByIdAndUpdate(prescriptionId, { paid: true });

        res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ success: false, message: "Verification error", error: error.message });
    }
});

module.exports = router;