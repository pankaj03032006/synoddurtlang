const Patient = require("../models/patient.js");
const Prescription = require("../models/prescription.js");
const User = require("../models/user.js");
const Doctor = require("../models/doctor.js");

const getPatients = async (req, res) => {
    try {
        const searchpatient = req.query.name ? new RegExp(req.query.name, 'i') : null;
        let patients = [];
        
        if (!searchpatient) {
            patients = await Patient.find({}).populate('userId');
        } else {
            patients = await Patient.find().populate({
                path: 'userId',
                select: 'firstName lastName email username',
                match: {
                    $or: [
                        { firstName: { $regex: searchpatient } },
                        { lastName: { $regex: searchpatient } },
                        { email: { $regex: searchpatient } }
                    ]
                }
            }).then((patients) => patients.filter(patient => patient.userId != null));
        }

        res.json(patients);
    } catch (error) {
        console.error("Error in getPatients:", error);
        res.status(500).json({ message: error.message });
    }
}

const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Patient ID is required" });
        }
        
        const patient = await Patient.findById(id).populate('userId');
        
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        res.json(patient);
    } catch (error) {
        console.error("Error in getPatientById:", error);
        res.status(500).json({ message: error.message });
    }
}

const isPatientValid = (newPatient, isUpdate = false) => {
    let errorList = [];
    
    if (!newPatient.firstName || newPatient.firstName.trim() === "") {
        errorList.push("Please enter first name");
    }
    if (!newPatient.lastName || newPatient.lastName.trim() === "") {
        errorList.push("Please enter last name");
    }
    if (!newPatient.email || newPatient.email.trim() === "") {
        errorList.push("Please enter email");
    }
    
    // Only validate password for new patients (not required for update)
    if (!isUpdate) {
        if (!newPatient.password) {
            errorList.push("Please enter password");
        }
        if (!newPatient.confirmPassword) {
            errorList.push("Please re-enter password in Confirm Password field");
        }
        if (newPatient.password !== newPatient.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newPatient.password && newPatient.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    } else {
        // For update, validate password only if provided
        if (newPatient.password && newPatient.password !== newPatient.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newPatient.password && newPatient.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    }
    
    if (!newPatient.phone || newPatient.phone.trim() === "") {
        errorList.push("Please enter phone");
    }

    if (errorList.length > 0) {
        return {
            status: false,
            errors: errorList
        };
    }
    
    return { status: true };
}

const savePatient = async (req, res) => {
    let newPatient = req.body;
    
    if (!newPatient) {
        return res.status(400).json({
            message: 'error',
            errors: ["Patient data is required"]
        });
    }
    
    let patientValidStatus = isPatientValid(newPatient, false);
    if (!patientValidStatus.status) {
        return res.status(400).json({
            message: 'error',
            errors: patientValidStatus.errors
        });
    }
    
    try {
        // Create user first
        const userDetails = await User.create({
            email: newPatient.email,
            username: newPatient.username,
            firstName: newPatient.firstName,
            lastName: newPatient.lastName,
            password: newPatient.password,
            userType: 'Patient',
            activated: true,
        });
        
        // Create patient with user reference
        newPatient.userId = userDetails._id;
        
        const patientDetails = await Patient.create(newPatient);
        
        res.status(201).json({ message: 'success' });
    } catch (error) {
        console.error("Error in savePatient:", error);
        
        // Rollback user creation if patient creation fails
        if (error && userDetails) {
            await User.deleteOne({ _id: userDetails._id });
        }
        
        res.status(400).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const updatePatient = async (req, res) => {
    let newPatient = req.body;
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({
            message: 'error',
            errors: ["Patient ID is required"]
        });
    }
    
    let patientValidStatus = isPatientValid(newPatient, true);
    if (!patientValidStatus.status) {
        return res.status(400).json({
            message: 'error',
            errors: patientValidStatus.errors
        });
    }
    
    try {
        // Check if patient exists
        const existingPatient = await Patient.findById(id);
        if (!existingPatient) {
            return res.status(404).json({
                message: 'error',
                errors: ["Patient not found"]
            });
        }
        
        // Update patient
        const updatedPatient = await Patient.updateOne(
            { _id: id }, 
            { 
                $set: { 
                    "phone": req.body.phone, 
                    "address": req.body.address, 
                    "gender": req.body.gender, 
                    "dob": req.body.dob 
                } 
            }
        );
        
        // Update user
        const updateUserData = {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "email": req.body.email,
            "username": req.body.username
        };
        
        // Only update password if provided
        if (req.body.password) {
            updateUserData.password = req.body.password;
        }
        
        const updatedUser = await User.updateOne(
            { _id: req.body.userId }, 
            { $set: updateUserData }
        );
        
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error("Error in updatePatient:", error);
        res.status(400).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Patient ID is required" });
        }
        
        const patient = await Patient.findById(id).populate('userId');
        
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        // Delete patient
        const deletedPatient = await Patient.deleteOne({ _id: id });
        
        // Delete associated user
        if (patient.userId && patient.userId._id) {
            await User.deleteOne({ _id: patient.userId._id });
        }
        
        res.status(200).json({ 
            message: 'success',
            deleted: deletedPatient
        });
    } catch (error) {
        console.error("Error in deletePatient:", error);
        res.status(500).json({ message: error.message });
    }
}

const getPatientHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                message: "error",
                errors: ["Patient ID is required"] 
            });
        }
        
        // Check if patient exists
        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({ 
                message: "error",
                errors: ["Patient not found"] 
            });
        }
        
        let prescriptions = await Prescription.find()
            .populate({
                path: 'prescribedMed.medicineId',
            })
            .populate({
                path: 'appointmentId',
                match: { patientId: id },
                populate: [
                    {
                        path: 'patientId',
                        populate: {
                            path: 'userId'
                        }
                    },
                    {
                        path: 'doctorId',
                        populate: {
                            path: 'userId'
                        }
                    }
                ]
            })
            .then((prescriptions) => prescriptions.filter(pre => pre.appointmentId != null));
        
        res.status(200).json({
            "message": "success",
            "prescriptions": prescriptions
        });
    } catch (error) {
        console.error("Error in getPatientHistory:", error);
        res.status(500).json({ 
            message: "error", 
            errors: [error.message] 
        });
    }
}

module.exports = {
    getPatients,
    getPatientById,
    savePatient,
    updatePatient,
    deletePatient,
    getPatientHistory
};