// src/components/Login/ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import styles from './Login.module.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('https://hospital-management-system-2-dni5.onrender.com/forgot-password', { 
                email 
            });
            
            if (response.data.message === 'success') {
                setStep(2);
                setMessage('OTP generated! Check your terminal/console for the OTP code.');
            } else {
                setError(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.message || 'Failed to connect to server. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('https://hospital-management-system-2-dni5.onrender.com/reset-password', {
                email,
                otp,
                newPassword
            });
            
            if (response.data.message === 'success') {
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id={styles.loginBody}>
            <div className={styles.greenLayer1}>
                <div id={styles.loginFormDiv}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{ color: '#2c3e50' }}>
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h2>
                        <p className="text-muted">
                            {step === 1 
                                ? 'Enter your email to receive OTP' 
                                : 'Enter OTP and new password'}
                        </p>
                    </div>

                    {message && (
                        <Alert severity="success" className="mb-3" onClose={() => setMessage('')}>
                            {message}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" className="mb-3" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <div className='form-floating mt-3'>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="form-control"
                                    disabled={loading}
                                    autoComplete="email"
                                />
                                <label htmlFor="email">Email Address</label>
                            </div>

                            <div className='d-flex flex-column flex-md-row gap-3 mt-4'>
                                <button 
                                    className='col-12 col-md-6 btn btn-primary py-2' 
                                    type="submit" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <CircularProgress size={20} color="inherit" />
                                            <span className="ms-2">Sending OTP...</span>
                                        </>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>
                                <button 
                                    type="button"
                                    className='col-12 col-md-6 btn btn-outline-secondary py-2'
                                    onClick={() => navigate('/login')}
                                    disabled={loading}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className='form-floating mt-3'>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="form-control"
                                    disabled={loading}
                                />
                                <label htmlFor="otp">OTP Code</label>
                            </div>

                            <div className='form-floating mt-4 position-relative'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="form-control"
                                    disabled={loading}
                                />
                                <label htmlFor="newPassword">New Password</label>
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>

                            <div className='form-floating mt-4 position-relative'>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="form-control"
                                    disabled={loading}
                                />
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>

                            <div className='d-flex flex-column flex-md-row gap-3 mt-4'>
                                <button 
                                    className='col-12 col-md-6 btn btn-primary py-2' 
                                    type="submit" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <CircularProgress size={20} color="inherit" />
                                            <span className="ms-2">Resetting...</span>
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                                <button 
                                    type="button"
                                    className='col-12 col-md-6 btn btn-outline-secondary py-2'
                                    onClick={() => {
                                        setStep(1);
                                        setOtp('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;