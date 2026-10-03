const Prescription = require("../models/prescription.js");
const Appointment = require("../models/appointment.js");
const mongoose = require("mongoose");

const userSelect = "firstName lastName email username";

const sendError = (res, status, errors) =>
    res.status(status).json({ message: "error", errors });

// Builds the appointment filter based on who is asking
const buildAppointmentFilter = (sender = {}, body = {}) => {
    const { userType, patientId, doctorId } = sender;

    switch (userType) {
        case "Patient":
            return patientId ? { patientId } : null;

        case "Doctor":
            if (!doctorId) return null;
            return body.patientId
                ? { doctorId, patientId: body.patientId }
                : { doctorId };

        default: { // Admin or other roles
            const filter = {};
            if (body.patientId) filter.patientId = body.patientId;
            if (body.doctorId) filter.doctorId = body.doctorId;
            return filter;
        }
    }
};

const getPrescriptions = async (req, res) => {
    try {
        const filter = buildAppointmentFilter(req.sender, req.body);

        if (!filter) {
            return sendError(res, 400, ["User ID not found"]);
        }

        // Filter in the database instead of loading every prescription
        const appointmentIds = await Appointment.find(filter).distinct("_id");

        const prescriptions = await Prescription.find({
            appointmentId: { $in: appointmentIds },
        })
            .sort({ createdAt: -1 }) // newest first
            .populate({
                path: "prescribedMed.medicineId",
                select: "name company price description",
            })
            .populate({
                path: "appointmentId",
                populate: [
                    {
                        path: "patientId",
                        populate: { path: "userId", select: userSelect },
                    },
                    {
                        path: "doctorId",
                        populate: { path: "userId", select: userSelect },
                    },
                ],
            })
            .lean();

        res.json({
            message: "success",
            prescriptions,
            count: prescriptions.length,
        });
    } catch (error) {
        console.error("Error in getPrescriptions:", error);
        sendError(res, 500, [error.message]);
    }
};

const validatePrescription = (prescription) => {
    const errors = [];

    if (!prescription || typeof prescription !== "object") {
        return ["Prescription data is required"];
    }

    if (!prescription.appointmentId) {
        errors.push("Appointment ID is required");
    }

    const meds = prescription.prescribedMed;
    if (!Array.isArray(meds)) {
        errors.push("Prescribed medicines must be an array");
    } else if (meds.length === 0) {
        errors.push("At least one prescribed medicine is required");
    } else {
        meds.forEach((med, i) => {
            const n = i + 1;
            if (!med.medicineId) errors.push(`Medicine ID is required for item ${n}`);
            if (!med.dosage) errors.push(`Dosage is required for item ${n}`);
            if (!med.qty || med.qty <= 0) errors.push(`Valid quantity is required for item ${n}`);
        });
    }

    return errors;
};

const savePrescription = async (req, res) => {
    console.log("savePrescription called:", JSON.stringify(req.body));

    const prescription = req.body;

    const validationErrors = validatePrescription(prescription);
    if (validationErrors.length > 0) {
        return sendError(res, 400, validationErrors);
    }

    try {
        const appointment = await Appointment.findById(prescription.appointmentId);

        if (!appointment) {
            return sendError(res, 404, ["Appointment not found"]);
        }
        if (appointment.completed) {
            return sendError(res, 400, ["Prescription already created for this appointment"]);
        }

        const prescriptionDetails = await Prescription.create(prescription);

        // ===== TEMPORARY VERIFICATION LOGS =====
        console.log("✅ WROTE TO DB:", mongoose.connection.name);
        console.log("🆔 New prescription _id:", prescriptionDetails._id.toString());
        const count = await Prescription.countDocuments();
        console.log("📊 Total prescriptions in DB:", count);
        // ======================================

        appointment.completed = true;
        await appointment.save();

        res.status(201).json({
            message: "success",
            prescription: prescriptionDetails,
            appointment,
        });
    } catch (error) {
        console.error("Error in savePrescription:", error);
        const status = error.name === "ValidationError" ? 400 : 500;
        sendError(res, status, [error.message]);
    }
};

module.exports = { getPrescriptions, savePrescription };