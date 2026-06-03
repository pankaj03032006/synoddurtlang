const Doctor = require("../models/doctor.js");
const User = require("../models/user.js");

const getDoctors = async (req, res) => {
    try {
        let searchdoctor = req.query.name ? new RegExp(req.query.name, 'i') : null;
        let doctors = [];
        
        if (!searchdoctor) {
            doctors = await Doctor.find({}).populate('userId');
        } else {
            doctors = await Doctor.find().populate({
                path: 'userId',
                select: 'firstName lastName email username',
                match: {
                    $or: [
                        { firstName: { $regex: searchdoctor } },
                        { lastName: { $regex: searchdoctor } },
                        { email: { $regex: searchdoctor } }
                    ]
                }
            }).then((doctors) => doctors.filter(doctor => doctor.userId != null));
        }

        res.json(doctors);
    } catch (error) {
        console.error("Error in getDoctors:", error);
        res.status(500).json({ message: error.message });
    }
}

const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }
        
        const doctor = await Doctor.findById(id).populate('userId');
        
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        res.json(doctor);
    } catch (error) {
        console.error("Error in getDoctorById:", error);
        res.status(500).json({ message: error.message });
    }
}

const isDoctorValid = (newdoctor) => {
    let errorList = [];
    
    if (!newdoctor.firstName) {
        errorList.push("Please enter first name");
    }
    if (!newdoctor.lastName) {
        errorList.push("Please enter last name");
    }
    if (!newdoctor.email) {
        errorList.push("Please enter email");
    }
    if (!newdoctor.password) {
        errorList.push("Please enter password");
    }
    if (!newdoctor.confirmPassword) {
        errorList.push("Please re-enter password in Confirm Password field");
    }
    if (newdoctor.password !== newdoctor.confirmPassword) {
        errorList.push("Password and Confirm Password did not match");
    }
    if (newdoctor.password && newdoctor.password.length > 0 && newdoctor.password.length <= 6) {
        errorList.push("Password length must be greater than 6 characters");
    }

    if (errorList.length > 0) {
        return {
            status: false,
            errors: errorList
        };
    }
    
    return { status: true };
}

const saveDoctor = async (req, res) => {
    let newdoctor = req.body;
    
    // Validate required fields
    if (!newdoctor) {
        return res.status(400).json({
            message: 'error',
            errors: ["Doctor information is required"]
        });
    }

    let doctorValidStatus = isDoctorValid(newdoctor);
    if (!doctorValidStatus.status) {
        return res.status(400).json({
            message: 'error',
            errors: doctorValidStatus.errors
        });
    }
    
    try {
        // Create user first
        const userDetails = await User.create({
            email: newdoctor.email,
            username: newdoctor.username,
            firstName: newdoctor.firstName,
            lastName: newdoctor.lastName,
            password: newdoctor.password,
            userType: 'Doctor',
            activated: true,
        });
        
        // Create doctor with user reference
        newdoctor.userId = userDetails._id;
        
        const doctorDetails = await Doctor.create(newdoctor);
        
        res.status(201).json({ message: 'success' });
    } catch (error) {
        console.error("Error in saveDoctor:", error);
        
        // If doctor creation fails, rollback user creation
        if (error && userDetails) {
            await User.deleteOne({ _id: userDetails._id });
        }
        
        res.status(400).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const updateDoctor = async (req, res) => {
    let newdoctor = req.body;
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({
            message: 'error',
            errors: ["Doctor ID is required"]
        });
    }
    
    // For update, password validation is optional
    let errorList = [];
    if (newdoctor.password && newdoctor.password !== newdoctor.confirmPassword) {
        errorList.push("Password and Confirm Password did not match");
    }
    if (newdoctor.password && newdoctor.password.length <= 6) {
        errorList.push("Password length must be greater than 6 characters");
    }
    
    if (errorList.length > 0) {
        return res.status(400).json({
            message: 'error',
            errors: errorList
        });
    }
    
    try {
        // Update doctor
        const updatedDoctor = await Doctor.updateOne(
            { _id: id },
            { 
                $set: { 
                    "phone": req.body.phone, 
                    "department": req.body.department 
                } 
            }
        );
        
        if (updatedDoctor.matchedCount === 0) {
            return res.status(404).json({
                message: 'error',
                errors: ["Doctor not found"]
            });
        }
        
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
        console.error("Error in updateDoctor:", error);
        res.status(400).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }
        
        const doctor = await Doctor.findById(id).populate('userId');
        
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        // Delete doctor
        const deletedDoctor = await Doctor.deleteOne({ _id: id });
        
        // Delete associated user
        if (doctor.userId && doctor.userId._id) {
            await User.deleteOne({ _id: doctor.userId._id });
        }
        
        res.status(200).json({ 
            message: 'success',
            deleted: deletedDoctor
        });
    } catch (error) {
        console.error("Error in deleteDoctor:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getDoctors,
    getDoctorById,
    saveDoctor,
    updateDoctor,
    deleteDoctor
};