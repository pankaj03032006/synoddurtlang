const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const bcrypt = require("bcrypt");
require("dotenv").config();

const isLoginValid = (email, password) => {
    const errorList = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        errorList.push("Please enter email");
    } else if (!emailRegex.test(email)) {
        errorList.push("Invalid email format");
    }

    if (!password) {
        errorList.push("Please enter password");
    }

    if (errorList.length > 0) {
        return { status: false, errors: errorList };
    }
    return { status: true };
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const loginValidStatus = isLoginValid(email, password);
        if (!loginValidStatus.status) {
            return res.status(400).json({ message: "error", errors: loginValidStatus.errors });
        }

        // Find user by email
        const user = await User.findOne({ email: email });
        
        if (!user) {
            return res.status(401).json({ message: "error", errors: ["User not found"] });
        }

        // Check if user is activated
        if (user.activated === false) {
            return res.status(401).json({ 
                message: "error", 
                errors: ["Please verify your account. A verification email has been sent to your email address."] 
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: "error", errors: ["Invalid password"] });
        }

        // Get patient ID if user is a patient
        let patientId = null;
        let doctorId = null;
        
        if (user.userType === 'Patient') {
            const patient = await Patient.findOne({ userId: user._id });
            if (patient) {
                patientId = patient._id;
                console.log(`Found patient ID for ${user.email}: ${patientId}`);
            } else {
                // If no patient record exists, create one
                console.log(`No patient record found for ${user.email}, creating one...`);
                const newPatient = await Patient.create({
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username
                });
                patientId = newPatient._id;
                console.log(`Created new patient record with ID: ${patientId}`);
            }
        } else if (user.userType === 'Doctor') {
            const doctor = await Doctor.findOne({ userId: user._id });
            if (doctor) {
                doctorId = doctor._id;
                console.log(`Found doctor ID for ${user.email}: ${doctorId}`);
            }
        }

        // Create user object for response with patient/doctor IDs
        const currentUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            userId: user._id,
            email: user.email,
            username: user.username,
            patientId: patientId,  // Will be null for non-patients
            doctorId: doctorId      // Will be null for non-doctors
        };

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                userType: user.userType,
                email: user.email,
                patientId: patientId,
                doctorId: doctorId
            }, 
            process.env.SECRET_KEY, 
            { expiresIn: "365d" }
        );

        // Send success response
        return res.json({ 
            message: "success", 
            user: currentUser, 
            token: token 
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            message: "error", 
            errors: [error.message || "Internal server error"] 
        });
    }
};

module.exports = {
    loginUser
};