require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// Middlewares  -------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection --------------------
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

// Import User Model
const User = require("./models/user");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============ FORGOT PASSWORD ROUTES ============

// Forgot Password - Send OTP
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        // Check if user exists using your User model
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiration (5 minutes)
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });
        
        console.log(`OTP for ${email}: ${otp}`); // For testing
        
        // Send email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - Hospital Management System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
                    <p>Dear ${user.firstName} ${user.lastName},</p>
                    <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="margin: 20px 0;" />
                    <p style="color: #666; font-size: 12px; text-align: center;">&copy; Hospital Management System. All rights reserved.</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({ message: 'success', otpSent: true });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
});

// Reset Password - Verify OTP and set new password
app.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        
        // Verify OTP
        const storedData = otpStore.get(email);
        
        if (!storedData) {
            return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
        }
        
        if (storedData.expiresAt < Date.now()) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }
        
        // Hash new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password using findOneAndUpdate
        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete OTP from store
        otpStore.delete(email);
        
        res.json({ message: 'success' });
    } catch (error) {
        console.error('Error in reset-password:', error);
        res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
});

// Routes Import -------------------------
const LoginRegisterRoute = require("./routes/LoginRegisterRoute");
const UserRoute = require("./routes/UserRoute");
const DashboardRoute = require("./routes/DashboardRoute");
const PatientRoute = require("./routes/PatientRoute");
const DoctorRoute = require("./routes/DoctorRoute");
const AppointmentRoute = require("./routes/AppointmentRoute");
const MedicineRoute = require("./routes/MedicineRoute");
const PrescriptionRoute = require("./routes/PrescriptionRoute");
const InvoiceRoute = require("./routes/InvoiceRoute");
const ProfileRoute = require("./routes/ProfileRoute");

// API Routes Middleware -----------------
app.use(LoginRegisterRoute);
app.use(DashboardRoute);
app.use(UserRoute);
app.use(PatientRoute);
app.use(DoctorRoute);
app.use(AppointmentRoute);
app.use(MedicineRoute);
app.use(PrescriptionRoute);
app.use(InvoiceRoute);
app.use(ProfileRoute);

app.use('/api/paypal', require('./routes/api/paypal'));

// Default Route -------------------------
app.get("/", (req, res) => {
    res.send("hello world");
});

// Start Server --------------------------
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port " + (process.env.PORT || 5000));
});