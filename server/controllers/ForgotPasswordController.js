// server/controllers/ForgotPasswordController.js
const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Store OTPs temporarily
const otpStore = new Map();

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Forgot Password - Generate OTP (NO EMAIL)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('📧 Forgot password request for email:', email);
        
        if (!email) {
            return res.status(400).json({ 
                message: 'error', 
                message: 'Email is required' 
            });
        }
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                message: 'error', 
                message: 'User not found with this email' 
            });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiration (5 minutes)
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });
        
        // Display OTP in console
        console.log('\n========================================');
        console.log(`PASSWORD RESET OTP FOR: ${email}`);
        console.log(`OTP CODE: ${otp}`);
        console.log('========================================\n');
        
        // Return success
        return res.status(200).json({ 
            message: 'success'
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            message: 'error', 
            message: error.message || 'Failed to process request'
        });
    }
};

// Reset Password - Verify OTP and set new password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        console.log('Reset password for:', email);
        
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                message: 'error', 
                message: 'Email, OTP, and new password are required'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'error', 
                message: 'Password must be at least 6 characters'
            });
        }
        
        // Verify OTP
        const storedData = otpStore.get(email);
        
        if (!storedData) {
            return res.status(400).json({ 
                message: 'error', 
                message: 'No OTP request found. Please request a new OTP.'
            });
        }
        
        if (storedData.expiresAt < Date.now()) {
            otpStore.delete(email);
            return res.status(400).json({ 
                message: 'error', 
                message: 'OTP has expired. Please request a new OTP.'
            });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ 
                message: 'error', 
                message: 'Invalid OTP. Please try again.'
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password
        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ 
                message: 'error', 
                message: 'User not found'
            });
        }
        
        // Delete OTP from store
        otpStore.delete(email);
        
        console.log(`Password reset successful for: ${email}`);
        
        return res.status(200).json({ message: 'success' });
        
    } catch (error) {
        console.error('Reset error:', error);
        return res.status(500).json({ 
            message: 'error', 
            message: 'Failed to reset password. Please try again.'
        });
    }
};

module.exports = { forgotPassword, resetPassword };