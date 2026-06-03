import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import { UserContext } from '../../Context/UserContext';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import styles from './Login.module.css';

function Login() {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    const { signInUser } = useContext(UserContext);

    const handleDialogueOpen = useCallback(() => {
        setErrorDialogueBoxOpen(true);
    }, []);

    const handleDialogueClose = useCallback(() => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
        setFieldErrors({});
    }, []);

    const validateForm = useCallback(() => {
        const errors = {};
        
        if (!email) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Please enter a valid email address";
        }
        
        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [email, password]);

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setFieldErrors({});
        
        try {
            const user = {
                email: email.trim(),
                password: password
            };
            
            console.log('Sending login request:', { email: user.email });
            
            const response = await fetch('https://hospital-management-system-2-dni5.onrender.com/login', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            });
            
            console.log('Response status:', response.status);
            
            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error("Server returned an invalid response");
            }
            
            const data = await response.json();
            console.log('Login response data:', data);
            
            // Check for success response
            if (response.ok && data.message === "success" && data.user) {
                // Store user data and token in context
                signInUser(data.user, data.token);
                
                // Store in localStorage with correct keys
                localStorage.setItem("token", data.token);
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                localStorage.setItem("userType", data.user.userType);
                localStorage.setItem("userId", data.user.userId || data.user._id);
                localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
                
                console.log('Login successful! User type:', data.user.userType);
                
                // FIXED: Redirect to correct dashboard routes
                if (data.user.userType === 'Admin') {
                    navigate("/admin/dashboard");
                } else if (data.user.userType === 'Doctor') {
                    navigate("/doctor/dashboard");
                } else if (data.user.userType === 'Patient') {
                    navigate("/patient/dashboard");
                } else {
                    navigate("/login");
                }
            } else {
                // Handle error response
                let errorMessages = [];
                
                if (data.errors && Array.isArray(data.errors)) {
                    errorMessages = data.errors;
                } else if (data.message && data.message !== "success") {
                    errorMessages = [data.message];
                } else {
                    errorMessages = ["Invalid email or password. Please try again."];
                }
                
                setErrorList(errorMessages);
                handleDialogueOpen();
            }
        } catch (error) {
            console.error("Login error:", error);
            
            if (error.message === 'Failed to fetch') {
                setErrorList([
                    "Cannot connect to server. Please check:",
                    "1. Backend is running on port 3001",
                    "2. Run 'npm start' in the server folder",
                    "3. Check if MongoDB is connected"
                ]);
            } else {
                setErrorList([error.message || "Network error. Please check your connection and try again."]);
            }
            handleDialogueOpen();
        } finally {
            setLoading(false);
        }
    }, [email, password, validateForm, signInUser, navigate, handleDialogueOpen]);

    const signUpClicked = useCallback(() => {
        navigate("/signup");
    }, [navigate]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const handleForgotPassword = useCallback(() => {
        navigate("/forgot-password");
    }, [navigate]);

    return (
        <div id={styles.loginBody}>
            <div className={styles.greenLayer1}>
                <div id={styles.loginFormDiv}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Welcome Back!</h2>
                        <p className="text-muted">Please login to your account</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="col-12 col-md-8 col-lg-6 mx-auto" name="loginForm" id="loginForm">
                        {/* Email Field */}
                        <div className='form-floating mt-3'>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (fieldErrors.email) {
                                        setFieldErrors(prev => ({ ...prev, email: '' }));
                                    }
                                }}
                                required
                                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                                disabled={loading}
                                autoComplete="email"
                            />
                            <label htmlFor="email">Email Address</label>
                            {fieldErrors.email && (
                                <div className="invalid-feedback">
                                    {fieldErrors.email}
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className='form-floating mt-4 position-relative'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    if (fieldErrors.password) {
                                        setFieldErrors(prev => ({ ...prev, password: '' }));
                                    }
                                }}
                                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                                required
                                placeholder="password"
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <label htmlFor="password">Password</label>
                            <div className="position-absolute end-0 top-50 translate-middle-y me-2" style={{ zIndex: 5 }}>
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                    disabled={loading}
                                    size="small"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>
                            {fieldErrors.password && (
                                <div className="invalid-feedback">
                                    {fieldErrors.password}
                                </div>
                            )}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-end mt-2">
                            <button
                                type="button"
                                className="btn btn-link text-decoration-none p-0"
                                onClick={handleForgotPassword}
                                disabled={loading}
                                style={{ fontSize: '0.9rem' }}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Form Actions */}
                        <div className='d-flex flex-column flex-md-row gap-3 mt-4'>
                            <button 
                                className='col-12 col-md-6 btn btn-primary py-2' 
                                id={styles.loginBtn} 
                                type="submit" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} color="inherit" />
                                        <span className="ms-2">Logging in...</span>
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                            <button 
                                type="button"
                                className='col-12 col-md-6 btn btn-outline-secondary py-2'
                                onClick={signUpClicked}
                                disabled={loading}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Demo Credentials Info */}
                        <div className="alert alert-info mt-4 mb-0" role="alert">
                            <small>
                                <strong>Demo Credentials:</strong><br />
                                Patient: patient@example.com / patient123<br />
                                Doctor: doctor@example.com / doctor123<br />
                                Admin: admin@example.com / admin123
                            </small>
                        </div>
                    </form>
                </div>
            </div>
            
            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleDialogueClose}
                ErrorTitle="Login Error"
                ErrorList={errorList}
            />
        </div>
    );
}

export default Login;