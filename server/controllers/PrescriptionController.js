const Prescription = require("../models/prescription.js");
const Appointment = require("../models/appointment.js");

const getPrescriptions = async (req, res) => {
    try {
        const searchpatient = req.body.patientId;
        const searchdoctor = req.sender?.doctorId || req.body.doctorId;
        const userType = req.sender?.userType;
        
        let matchQuery = {};

        // Build match query based on user type
        switch (userType) {
            case 'Patient':
                const patientId = req.sender?.patientId;
                if (!patientId) {
                    return res.status(400).json({ 
                        message: "error", 
                        errors: ["Patient ID not found"] 
                    });
                }
                matchQuery = { patientId: patientId };
                break;
                
            case 'Doctor':
                const doctorId = req.sender?.doctorId;
                if (searchpatient && searchdoctor) {
                    matchQuery = { patientId: searchpatient, doctorId: searchdoctor };
                } else if (searchpatient) {
                    matchQuery = { patientId: searchpatient };
                } else if (searchdoctor) {
                    matchQuery = { doctorId: searchdoctor };
                } else if (doctorId) {
                    matchQuery = { doctorId: doctorId };
                }
                break;
                
            default: // Admin or other roles
                if (searchpatient && searchdoctor) {
                    matchQuery = { patientId: searchpatient, doctorId: searchdoctor };
                } else if (searchpatient) {
                    matchQuery = { patientId: searchpatient };
                } else if (searchdoctor) {
                    matchQuery = { doctorId: searchdoctor };
                }
                break;
        }

        const prescriptions = await Prescription.find({})
            .populate({
                path: 'prescribedMed.medicineId',
                select: 'name company price description'
            })
            .populate({
                path: 'appointmentId',
                match: matchQuery,
                populate: [
                    {
                        path: 'patientId',
                        populate: {
                            path: 'userId',
                            select: 'firstName lastName email username'
                        }
                    },
                    {
                        path: 'doctorId',
                        populate: {
                            path: 'userId',
                            select: 'firstName lastName email username'
                        }
                    }
                ]
            })
            .then((prescriptions) => prescriptions.filter(pre => pre.appointmentId != null))
            .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first

        res.json({ 
            message: "success", 
            prescriptions: prescriptions,
            count: prescriptions.length 
        });
        
    } catch (error) {
        console.error("Error in getPrescriptions:", error);
        res.status(500).json({ 
            message: "error", 
            errors: [error.message] 
        });
    }
}

const savePrescription = async (req, res) => {
    let prescription = req.body;
    
    // Validate required fields
    const validationErrors = [];
    
    if (!prescription) {
        validationErrors.push("Prescription data is required");
    }
    
    if (!prescription.appointmentId) {
        validationErrors.push("Appointment ID is required");
    }
    
    if (!prescription.prescribedMed || !Array.isArray(prescription.prescribedMed)) {
        validationErrors.push("Prescribed medicines must be an array");
    } else if (prescription.prescribedMed.length === 0) {
        validationErrors.push("At least one prescribed medicine is required");
    } else {
        // Validate each medicine entry
        prescription.prescribedMed.forEach((med, index) => {
            if (!med.medicineId) {
                validationErrors.push(`Medicine ID is required for item ${index + 1}`);
            }
            if (!med.dosage) {
                validationErrors.push(`Dosage is required for item ${index + 1}`);
            }
            if (!med.qty || med.qty <= 0) {
                validationErrors.push(`Valid quantity is required for item ${index + 1}`);
            }
        });
    }
    
    if (validationErrors.length > 0) {
        return res.status(400).json({ 
            message: 'error', 
            errors: validationErrors 
        });
    }
    
    try {
        // Check if appointment exists and is not already completed
        const existingAppointment = await Appointment.findById(prescription.appointmentId);
        
        if (!existingAppointment) {
            return res.status(404).json({ 
                message: 'error', 
                errors: ["Appointment not found"] 
            });
        }
        
        if (existingAppointment.completed) {
            return res.status(400).json({ 
                message: 'error', 
                errors: ["Prescription already created for this appointment"] 
            });
        }
        
        // Create prescription
        const prescriptionDetails = await Prescription.create(prescription);
        
        // Update appointment as completed
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            prescription.appointmentId, 
            { completed: true },
            { new: true }
        );
        
        res.status(201).json({ 
            message: 'success', 
            prescription: prescriptionDetails,
            appointment: updatedAppointment
        });
        
    } catch (error) {
        console.error("Error in savePrescription:", error);
        res.status(400).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

module.exports = {
    getPrescriptions,
    savePrescription
};