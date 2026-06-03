const express = require("express");
const router = express.Router();

const {
    signUp,
    verifyUser
} = require('../controllers/RegisterController.js')

const {
    loginUser
} = require('../controllers/LoginController.js')

const {
    forgotPassword,
    resetPassword
} = require('../controllers/ForgotPasswordController.js')

router.post('/signup', signUp);
router.get('/verify/:id', verifyUser);
router.post('/login', loginUser);

// Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;