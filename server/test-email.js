// server/test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('Email user:', process.env.GMAIL_USER);
    console.log('Email pass length:', process.env.GMAIL_PASS?.length);
    
    // Remove spaces from password if any
    const password = process.env.GMAIL_PASS?.replace(/\s/g, '');
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: password
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to yourself
            subject: 'Test Email',
            text: 'This is a test email from Hospital Management System'
        });
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Email error details:');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('Response:', error.response);
    }
}

testEmail();