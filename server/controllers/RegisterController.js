const User = require("../models/user");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");

const crypto = require('crypto');
const nodemailer = require('nodemailer');
require("dotenv").config();

const isUserValid = (newUser) => {
    const errorList = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // First name validation - simplified
    if (!newUser.firstName || newUser.firstName.trim() === "") {
        errorList.push('Please enter first name');
    } else if (newUser.firstName.trim().length < 2) {
        errorList.push('First name must be at least 2 characters');
    }
    
    // Last name validation - simplified
    if (!newUser.lastName || newUser.lastName.trim() === "") {
        errorList.push('Please enter last name');
    } else if (newUser.lastName.trim().length < 2) {
        errorList.push('Last name must be at least 2 characters');
    }

    if (!newUser.email || newUser.email.trim() === "") {
        errorList.push("Please enter email");
    } else if (!emailRegex.test(newUser.email)) {
        errorList.push("Invalid email format");
    }

    if (!newUser.password) {
        errorList.push("Please enter password");
    } else if (newUser.password.length <= 6) {
        errorList.push("Password length must be greater than 6 characters");
    }

    if (!newUser.confirmPassword) {
        errorList.push("Please re-enter password in Confirm Password field");
    }

    if (!newUser.userType) {
        errorList.push("Please enter User Type");
    }

    if (newUser.password !== newUser.confirmPassword) {
        errorList.push("Password and Confirm Password did not match");
    }

    // Validate department for Doctor
    if (newUser.userType === "Doctor" && (!newUser.department || newUser.department.trim() === "")) {
        errorList.push("Department is required for Doctor");
    }

    if (errorList.length > 0) {
        return { status: false, errors: errorList };
    }
    return { status: true };
};

const saveVerificationToken = async (userId, verificationToken) => {
    try {
        await User.findOneAndUpdate(
            { _id: userId }, 
            { verificationToken: verificationToken }
        );
        return true;
    } catch (error) {
        console.error("Error saving verification token:", error);
        return false;
    }
};

const generateVerificationToken = () => {
    const token = crypto.randomBytes(64).toString('hex');
    const expires = Date.now() + 3 * 60 * 60 * 1000;
    return {
        token: token,
        expires: expires
    };
};

const sendVerificationEmail = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const verificationLink = `https://hospital-management-system-2-dni5.onrender.com/verify/${token}`;
        
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Verify your email address',
            text: `Please click the following link to verify your email address: ${verificationLink}`,
            html: `<p>Please click this link to verify your account:</p> 
                   <a href="${verificationLink}">Verify Email</a>
                   <p>This link will expire in 3 hours.</p>`,
        };

        const resp = await transporter.sendMail(mailOptions);
        return resp;
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
};

const signUp = async (req, res) => {
    const newUser = req.body;

    if (!newUser) {
        return res.status(400).json({ 
            message: "error", 
            errors: ["User data is required"] 
        });
    }

    const userValidStatus = isUserValid(newUser);
    if (!userValidStatus.status) {
        return res.status(400).json({ 
            message: "error", 
            errors: userValidStatus.errors 
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: newUser.email });
        if (existingUser) {
            return res.status(400).json({ 
                message: "error", 
                errors: ["User with this email already exists"] 
            });
        }

        // Create user
        const userDetails = await User.create({
            email: newUser.email,
            username: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            password: newUser.password,
            userType: newUser.userType,
            activated: true
        });

        // Generate and save verification token
        const verificationToken = generateVerificationToken();
        await saveVerificationToken(userDetails._id, verificationToken);

        // Create role-specific profile
        if (newUser.userType === "Doctor") {
            await Doctor.create({
                userId: userDetails._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                username: newUser.email,
                department: newUser.department || "General" // Added department
            });
        } else if (newUser.userType === "Patient") {
            await Patient.create({
                userId: userDetails._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                username: newUser.email
            });
        }

        // Send verification email (optional)
        // await sendVerificationEmail(userDetails.email, verificationToken.token);

        res.status(201).json({ message: "success" });

    } catch (error) {
        console.error("Error in signUp:", error);
        
        res.status(500).json({ 
            message: "error", 
            errors: [error.message || "Failed to create user account"] 
        });
    }
};

const verifyUser = async (req, res) => {
    const token = req.params.id;
    
    if (!token) {
        return res.status(400).json({ 
            message: "error", 
            errors: ["Verification token is required"] 
        });
    }

    try {
        const user = await User.findOneAndUpdate(
            {
                'verificationToken.token': token,
                'verificationToken.expires': { $gt: Date.now() }
            },
            {
                activated: true,
                $unset: { verificationToken: "" }
            },
            { new: true }
        );

        if (!user) {
            const expiredUser = await User.findOne({
                'verificationToken.token': token,
                'verificationToken.expires': { $lte: Date.now() }
            });

            if (expiredUser) {
                return res.status(400).send(`
                    <html>
                        <body>
                            <h1>Verification Failed</h1>
                            <p>The verification link has expired. Please request a new verification email.</p>
                        </body>
                    </html>
                `);
            }

            return res.status(400).send(`
                <html>
                    <body>
                        <h1>Verification Failed</h1>
                        <p>Invalid verification token. The link may have been tampered with.</p>
                    </body>
                </html>
            `);
        }

        res.send(`
            <html>
                <head>
                    <meta http-equiv="refresh" content="3;url=http://localhost:3000/login" />
                </head>
                <body>
                    <h1>Email Verified Successfully!</h1>
                    <p>Your account has been activated. You will be redirected to the login page in 3 seconds.</p>
                    <p>If you are not redirected, <a href="http://localhost:3000/login">click here</a>.</p>
                </body>
            </html>
        `);
        
    } catch (error) {
        console.error("Error in verifyUser:", error);
        res.status(500).json({ 
            message: "error", 
            errors: ["An error occurred while verifying your account"] 
        });
    }
};

module.exports = {
    signUp,
    verifyUser
};