const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Prescription = require("../models/prescription.js");

const createInvoiceJSON = (prescription) => {
    if (!prescription || !prescription.appointmentId || !prescription.appointmentId.patientId) {
        throw new Error("Invalid prescription data");
    }

    const invoice = {
        shipping: {
            name: prescription.appointmentId.patientId.userId?.firstName + " " + prescription.appointmentId.patientId.userId?.lastName || "Unknown Patient",
            address: prescription.appointmentId.patientId.address || "No address provided",
            city: "Cambridge",
            state: "ON",
            country: "CA",
            postal_code: 94111
        },
        items: [
            {
                item: "Visitation",
                dosage: "",
                quantity: 1,
                amount: 200
            }
        ],
        subtotal: 820,
        paid: 0,
        invoice_nr: prescription._id
    };

    // Add prescribed medicines to items
    if (prescription.prescribedMed && Array.isArray(prescription.prescribedMed)) {
        for (let item of prescription.prescribedMed) {
            if (item.medicineId) {
                invoice.items.push({
                    item: item.medicineId.name || "Unknown Medicine",
                    dosage: item.dosage || "",
                    quantity: item.qty || 1,
                    amount: (item.medicineId.price || 0) * (item.qty || 1)
                });
            }
        }
    }

    // Calculate subtotal
    let total = 0;
    invoice.items.forEach((item) => {
        total += item.quantity * item.amount;
    });

    invoice.subtotal = total;
    invoice.paid = total;

    return invoice;
}

async function getInvoice(req, res) {
    try {
        const prescriptionId = req.params.id;
        
        if (!prescriptionId) {
            return res.status(400).json({ error: "Prescription ID is required" });
        }

        const prescription = await Prescription.findById(prescriptionId)
            .populate({
                path: 'prescribedMed.medicineId',
            })
            .populate({
                path: 'appointmentId',
                populate: [
                    {
                        path: 'patientId',
                        populate: {
                            path: 'userId',
                        }
                    },
                    {
                        path: 'doctorId',
                        populate: {
                            path: 'userId'
                        }
                    }
                ]
            });

        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found" });
        }

        const filePath = path.join(__dirname, '../public/invoice', `medical_invoice_${prescriptionId}.pdf`);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const invoiceJson = createInvoiceJSON(prescription);

        // Generate PDF
        await new Promise((resolve, reject) => {
            createInvoice(invoiceJson, filePath, prescriptionId, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // Check if file was created
        if (!fs.existsSync(filePath)) {
            throw new Error("PDF file was not created");
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=medical_invoice_${prescriptionId}.pdf`);
        
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        
        readStream.on('error', (error) => {
            console.error("Error streaming PDF:", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Error generating PDF" });
            }
        });

        // Clean up file after sending
        readStream.on('end', () => {
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error deleting temporary file:", err);
            });
        });

    } catch (error) {
        console.error("Error in getInvoice:", error);
        res.status(500).json({ error: error.message || "Failed to generate invoice" });
    }
}

function createInvoice(invoice, path, prescriptionId, callback) {
    try {
        let doc = new PDFDocument({ size: "A4", margin: 50 });
        const writeStream = fs.createWriteStream(path);
        
        doc.pipe(writeStream);
        
        generateHeader(doc);
        generateCustomerInformation(doc, invoice);
        generateInvoiceTable(doc, invoice);
        generateFooter(doc);
        
        doc.end();
        
        writeStream.on('finish', () => {
            callback(null);
        });
        
        writeStream.on('error', (error) => {
            console.error("Error writing PDF:", error);
            callback(error);
        });
        
        doc.on('error', (error) => {
            console.error("Error generating PDF:", error);
            callback(error);
        });
    } catch (error) {
        console.error("Error in createInvoice:", error);
        callback(error);
    }
}

function generateHeader(doc) {
    const logoPath = path.join(__dirname, '../public/images/logo.png');
    const logoExists = fs.existsSync(logoPath);
    
    if (logoExists) {
        doc.image(logoPath, 50, 45, { width: 50 });
    }
    
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Synod Hospital", 110, 57)
        .fontSize(10)
        .text("Synod Hospital", 200, 50, { align: "right" })
        .text("123 Main Street", 200, 65, { align: "right" })
        .text("Kitchener, ON, N7T 9U7", 200, 80, { align: "right" })
        .moveDown();
}

function generateCustomerInformation(doc, invoice) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Invoice", 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
        .fontSize(10)
        .text("Invoice Number:", 50, customerInformationTop)
        .font("Helvetica-Bold")
        .text(invoice.invoice_nr || "N/A", 150, customerInformationTop)
        .font("Helvetica")
        .text("Invoice Date:", 50, customerInformationTop + 15)
        .text(formatDate(new Date()), 150, customerInformationTop + 15)
        .text("Balance Due:", 50, customerInformationTop + 30)
        .text(
            formatCurrency(invoice.subtotal - invoice.paid),
            150,
            customerInformationTop + 30
        )
        .font("Helvetica-Bold")
        .text(invoice.shipping.name || "Unknown", 300, customerInformationTop)
        .font("Helvetica")
        .text(invoice.shipping.address || "No address", 300, customerInformationTop + 15)
        .text(
            (invoice.shipping.city || "") +
            ", " +
            (invoice.shipping.state || "") +
            ", " +
            (invoice.shipping.country || ""),
            300,
            customerInformationTop + 30
        )
        .moveDown();

    generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
    const invoiceTableTop = 330;

    doc.font("Helvetica-Bold");
    generateTableRow(
        doc,
        invoiceTableTop,
        "Item",
        "Dosage",
        "Unit Cost",
        "Quantity",
        "Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    if (invoice.items && invoice.items.length > 0) {
        for (let i = 0; i < invoice.items.length; i++) {
            const item = invoice.items[i];
            const position = invoiceTableTop + (i + 1) * 30;
            const unitCost = item.amount / item.quantity;
            generateTableRow(
                doc,
                position,
                item.item || "N/A",
                item.dosage || "",
                formatCurrency(unitCost),
                item.quantity,
                formatCurrency(item.amount)
            );
            generateHr(doc, position + 20);
        }

        const subtotalPosition = invoiceTableTop + (invoice.items.length + 1) * 30;
        generateTableRow(
            doc,
            subtotalPosition,
            "",
            "",
            "Subtotal",
            "",
            formatCurrency(invoice.subtotal)
        );

        const paidToDatePosition = subtotalPosition + 20;
        generateTableRow(
            doc,
            paidToDatePosition,
            "",
            "",
            "Paid To Date",
            "",
            formatCurrency(invoice.paid)
        );

        const duePosition = paidToDatePosition + 25;
        doc.font("Helvetica-Bold");
        generateTableRow(
            doc,
            duePosition,
            "",
            "",
            "Balance Due",
            "",
            formatCurrency(invoice.subtotal - invoice.paid)
        );
        doc.font("Helvetica");
    }
}

function generateFooter(doc) {
    doc
        .fontSize(10)
        .text(
            "Thank you for choosing Synod Hospital",
            50,
            780,
            { align: "center", width: 500 }
        );
}

function generateTableRow(doc, y, item, dosage, unitCost, quantity, lineTotal) {
    doc
        .fontSize(10)
        .text(item || "", 50, y)
        .text(dosage || "", 150, y)
        .text(unitCost || "$0.00", 280, y, { width: 90, align: "right" })
        .text((quantity || 0).toString(), 370, y, { width: 90, align: "right" })
        .text(lineTotal || "$0.00", 0, y, { align: "right" });
}

function generateHr(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

function formatCurrency(cents) {
    return "$" + (cents || 0).toFixed(2);
}

function formatDate(date) {
    if (!date) return "N/A";
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return year + "/" + month + "/" + day;
}

module.exports = {
    getInvoice
};