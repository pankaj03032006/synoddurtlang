const User = require("../models/user.js");
const Patient = require("../models/patient.js");
const Doctor = require("../models/doctor.js");

const getAdminByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const admin = await User.findOne({ _id: id });
        
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.json(admin);
    } catch (error) {
        console.error("Error in getAdminByUserId:", error);
        res.status(500).json({ message: error.message });
    }
}

const isAdminValid = (newUser, isUpdate = false) => {
    let errorList = [];
    
    if (!newUser.firstName || newUser.firstName.trim() === "") {
        errorList.push("Please enter first name");
    }
    if (!newUser.lastName || newUser.lastName.trim() === "") {
        errorList.push("Please enter last name");
    }
    if (!newUser.email || newUser.email.trim() === "") {
        errorList.push("Please enter email");
    }
    
    // Only validate password for new admins (not required for update)
    if (!isUpdate) {
        if (!newUser.password) {
            errorList.push("Please enter password");
        }
        if (!newUser.confirmPassword) {
            errorList.push("Please re-enter password in Confirm Password field");
        }
        if (newUser.password !== newUser.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newUser.password && newUser.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    } else {
        // For update, validate password only if provided
        if (newUser.password && newUser.password !== newUser.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newUser.password && newUser.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    }

    if (errorList.length > 0) {
        return {
            status: false,
            errors: errorList
        };
    }
    
    return { status: true };
}

const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        let newUser = req.body;
        
        if (!id) {
            return res.status(400).json({
                message: 'error',
                errors: ["User ID is required"]
            });
        }
        
        // Check if admin exists
        const existingAdmin = await User.findById(id);
        if (!existingAdmin) {
            return res.status(404).json({
                message: 'error',
                errors: ["Admin not found"]
            });
        }
        
        let userValidStatus = isAdminValid(newUser, true);
        if (!userValidStatus.status) {
            return res.status(400).json({
                message: 'error',
                errors: userValidStatus.errors
            });
        }
        
        // Prepare update data (only include provided fields)
        const updateData = {};
        if (newUser.firstName) updateData.firstName = newUser.firstName;
        if (newUser.lastName) updateData.lastName = newUser.lastName;
        if (newUser.email) updateData.email = newUser.email;
        if (newUser.username) updateData.username = newUser.username;
        if (newUser.password) updateData.password = newUser.password;
        
        const updatedUser = await User.updateOne(
            { _id: id }, 
            { $set: updateData }
        );
        
        if (updatedUser.matchedCount === 0) {
            return res.status(404).json({
                message: 'error',
                errors: ["Admin not found"]
            });
        }
        
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error("Error in updateAdmin:", error);
        res.status(500).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const getDoctorByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const doctor = await Doctor.findOne({ userId: id }).populate('userId');
        
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        res.json(doctor);
    } catch (error) {
        console.error("Error in getDoctorByUserId:", error);
        res.status(500).json({ message: error.message });
    }
}

const isDoctorValid = (newdoctor, isUpdate = false) => {
    let errorList = [];
    
    if (!newdoctor.firstName || newdoctor.firstName.trim() === "") {
        errorList.push("Please enter first name");
    }
    if (!newdoctor.lastName || newdoctor.lastName.trim() === "") {
        errorList.push("Please enter last name");
    }
    if (!newdoctor.email || newdoctor.email.trim() === "") {
        errorList.push("Please enter email");
    }
    
    // Only validate password for new doctors (not required for update)
    if (!isUpdate) {
        if (!newdoctor.password) {
            errorList.push("Please enter password");
        }
        if (!newdoctor.confirmPassword) {
            errorList.push("Please re-enter password in Confirm Password field");
        }
        if (newdoctor.password !== newdoctor.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newdoctor.password && newdoctor.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    } else {
        // For update, validate password only if provided
        if (newdoctor.password && newdoctor.password !== newdoctor.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newdoctor.password && newdoctor.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    }

    if (errorList.length > 0) {
        return {
            status: false,
            errors: errorList
        };
    }
    
    return { status: true };
}

const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        let newdoctor = req.body;
        
        if (!id) {
            return res.status(400).json({
                message: 'error',
                errors: ["Doctor ID is required"]
            });
        }
        
        // Check if doctor exists
        const existingDoctor = await Doctor.findById(id);
        if (!existingDoctor) {
            return res.status(404).json({
                message: 'error',
                errors: ["Doctor not found"]
            });
        }
        
        let doctorValidStatus = isDoctorValid(newdoctor, true);
        if (!doctorValidStatus.status) {
            return res.status(400).json({
                message: 'error',
                errors: doctorValidStatus.errors
            });
        }
        
        // Update doctor
        const doctorUpdateData = {};
        if (newdoctor.phone) doctorUpdateData.phone = newdoctor.phone;
        if (newdoctor.department) doctorUpdateData.department = newdoctor.department;
        
        if (Object.keys(doctorUpdateData).length > 0) {
            await Doctor.updateOne(
                { _id: id }, 
                { $set: doctorUpdateData }
            );
        }
        
        // Update user
        const userUpdateData = {};
        if (newdoctor.firstName) userUpdateData.firstName = newdoctor.firstName;
        if (newdoctor.lastName) userUpdateData.lastName = newdoctor.lastName;
        if (newdoctor.email) userUpdateData.email = newdoctor.email;
        if (newdoctor.username) userUpdateData.username = newdoctor.username;
        if (newdoctor.password) userUpdateData.password = newdoctor.password;
        
        if (Object.keys(userUpdateData).length > 0 && newdoctor.userId) {
            await User.updateOne(
                { _id: newdoctor.userId }, 
                { $set: userUpdateData }
            );
        }
        
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error("Error in updateDoctor:", error);
        res.status(500).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const getPatientByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const patient = await Patient.findOne({ userId: id }).populate('userId');
        
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        res.json(patient);
    } catch (error) {
        console.error("Error in getPatientByUserId:", error);
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

const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        let newPatient = req.body;
        
        if (!id) {
            return res.status(400).json({
                message: 'error',
                errors: ["Patient ID is required"]
            });
        }
        
        // Check if patient exists
        const existingPatient = await Patient.findById(id);
        if (!existingPatient) {
            return res.status(404).json({
                message: 'error',
                errors: ["Patient not found"]
            });
        }
        
        let patientValidStatus = isPatientValid(newPatient, true);
        if (!patientValidStatus.status) {
            return res.status(400).json({
                message: 'error',
                errors: patientValidStatus.errors
            });
        }
        
        // Update patient
        const patientUpdateData = {};
        if (newPatient.phone) patientUpdateData.phone = newPatient.phone;
        if (newPatient.address) patientUpdateData.address = newPatient.address;
        if (newPatient.gender) patientUpdateData.gender = newPatient.gender;
        if (newPatient.dob) patientUpdateData.dob = newPatient.dob;
        
        if (Object.keys(patientUpdateData).length > 0) {
            await Patient.updateOne(
                { _id: id }, 
                { $set: patientUpdateData }
            );
        }
        
        // Update user
        const userUpdateData = {};
        if (newPatient.firstName) userUpdateData.firstName = newPatient.firstName;
        if (newPatient.lastName) userUpdateData.lastName = newPatient.lastName;
        if (newPatient.email) userUpdateData.email = newPatient.email;
        if (newPatient.username) userUpdateData.username = newPatient.username;
        if (newPatient.password) userUpdateData.password = newPatient.password;
        
        if (Object.keys(userUpdateData).length > 0 && newPatient.userId) {
            await User.updateOne(
                { _id: newPatient.userId }, 
                { $set: userUpdateData }
            );
        }
        
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error("Error in updatePatient:", error);
        res.status(500).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

module.exports = {
    getAdminByUserId,
    updateAdmin,
    getDoctorByUserId,
    updateDoctor,
    getPatientByUserId,
    updatePatient,
};