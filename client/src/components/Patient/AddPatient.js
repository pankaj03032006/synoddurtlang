import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';


function AddPatient() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDOB] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [errorSnackbar, setErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const handleDialogueOpen = useCallback(() => {
    setErrorDialogueBoxOpen(true);
  }, []);

  const handleDialogueClose = useCallback(() => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false);
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!firstName || firstName.trim() === '') {
      errors.firstName = "First name is required";
    }
    
    if (!username || username.trim() === '') {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }
    
    if (!email || email.trim() === '') {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (password) {
      if (password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    if (phone && !/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be 10 digits";
    }
    
    if (dob && !isValidAge(dob)) {
      errors.dob = "Patient must be at least 1 year old";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [firstName, username, email, password, confirmPassword, phone, dob]);

  const isValidAge = (dobDate) => {
    const today = new Date();
    const birthDate = new Date(dobDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 1;
  };

  const addPatient = useCallback(async (event) => {
    event.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const patient = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
        confirmPassword: confirmPassword,
        address: address.trim(),
        gender: gender,
        dob: dob
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/patients`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(patient)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add patient');
      }
      
      if (data.message === "success") {
        setSuccessSnackbar(true);
        
        // Reset form after successful submission
        setTimeout(() => {
          navigate("/patients");
        }, 1500);
      } else {
        // Display error message
        if (data.errors && Array.isArray(data.errors)) {
          setErrorList(data.errors);
          handleDialogueOpen();
        } else if (data.message) {
          setErrorMessage(data.message);
          setErrorSnackbar(true);
        } else {
          setErrorMessage("Failed to add patient. Please try again.");
          setErrorSnackbar(true);
        }
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      setErrorMessage(error.message || "Network error. Please check your connection and try again.");
      setErrorSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, username, email, phone, password, confirmPassword, address, gender, dob, validateForm, navigate, handleDialogueOpen]);

  const handleCancel = useCallback(() => {
    navigate("/patients");
  }, [navigate]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Password validation effect
  useEffect(() => {
    if (password && password.length > 0 && password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }));
    } else if (password && password.length >= 6) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    
    if (confirmPassword && password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else if (confirmPassword && password === confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [password, confirmPassword]);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div className="page-wrapper">
        <div className="content">
          <div className="card-box">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h4 className="page-title">Add New Patient</h4>
                <p className="text-muted">Fill in the patient details to register them in the system</p>
              </div>
            </div>
            
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <form id="addPatientForm" name="addPatientForm" onSubmit={addPatient}>
                  <div className="row">
                    {/* First Name */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>First Name <span className="text-danger">*</span></label>
                        <input 
                          name="firstName" 
                          className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`} 
                          type="text" 
                          value={firstName} 
                          onChange={(event) => {
                            setFirstName(event.target.value);
                            if (fieldErrors.firstName) {
                              setFieldErrors(prev => ({ ...prev, firstName: '' }));
                            }
                          }}
                          disabled={loading}
                          placeholder="Enter first name"
                          required
                        />
                        {fieldErrors.firstName && (
                          <div className="invalid-feedback">
                            {fieldErrors.firstName}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Last Name */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Last Name</label>
                        <input 
                          name="lastName" 
                          className="form-control" 
                          type="text" 
                          value={lastName} 
                          onChange={(event) => setLastName(event.target.value)}
                          disabled={loading}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    
                    {/* Username */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Username <span className="text-danger">*</span></label>
                        <input 
                          name="username" 
                          className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`} 
                          type="text" 
                          value={username} 
                          onChange={(event) => {
                            setUsername(event.target.value);
                            if (fieldErrors.username) {
                              setFieldErrors(prev => ({ ...prev, username: '' }));
                            }
                          }}
                          disabled={loading}
                          placeholder="Enter username"
                          required
                        />
                        {fieldErrors.username && (
                          <div className="invalid-feedback">
                            {fieldErrors.username}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Email <span className="text-danger">*</span></label>
                        <input 
                          name="email" 
                          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`} 
                          type="email" 
                          value={email} 
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (fieldErrors.email) {
                              setFieldErrors(prev => ({ ...prev, email: '' }));
                            }
                          }}
                          disabled={loading}
                          placeholder="Enter email address"
                          required
                        />
                        {fieldErrors.email && (
                          <div className="invalid-feedback">
                            {fieldErrors.email}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Password */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Password</label>
                        <div className="position-relative">
                          <input 
                            name="password" 
                            className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`} 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={loading}
                            placeholder="Enter password"
                          />
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={loading}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </div>
                        {fieldErrors.password && (
                          <div className="invalid-feedback d-block">
                            {fieldErrors.password}
                          </div>
                        )}
                        <small className="text-muted">Password must be at least 6 characters (optional)</small>
                      </div>
                    </div>
                    
                    {/* Confirm Password */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="position-relative">
                          <input 
                            name="confirmPassword" 
                            className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`} 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword} 
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            disabled={loading}
                            placeholder="Confirm password"
                          />
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            disabled={loading}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </div>
                        {fieldErrors.confirmPassword && (
                          <div className="invalid-feedback d-block">
                            {fieldErrors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Phone */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Phone</label>
                        <input 
                          name="phone" 
                          className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`} 
                          type="tel" 
                          value={phone} 
                          onChange={(event) => {
                            setPhone(event.target.value.replace(/[^0-9]/g, ''));
                            if (fieldErrors.phone) {
                              setFieldErrors(prev => ({ ...prev, phone: '' }));
                            }
                          }}
                          disabled={loading}
                          placeholder="Enter 10-digit phone number"
                          maxLength="10"
                        />
                        {fieldErrors.phone && (
                          <div className="invalid-feedback">
                            {fieldErrors.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Address */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Address</label>
                        <textarea 
                          name="address" 
                          className="form-control" 
                          value={address} 
                          onChange={(event) => setAddress(event.target.value)}
                          disabled={loading}
                          rows="3"
                          placeholder="Enter patient's address"
                        />
                      </div>
                    </div>
                    
                    {/* Gender */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Gender</label>
                        <select 
                          name="gender" 
                          className="form-select" 
                          value={gender} 
                          onChange={(event) => setGender(event.target.value)}
                          disabled={loading}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Date of Birth */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Date of Birth</label>
                        <input 
                          name="dob" 
                          className={`form-control ${fieldErrors.dob ? 'is-invalid' : ''}`} 
                          type="date" 
                          value={dob} 
                          onChange={(event) => {
                            setDOB(event.target.value);
                            if (fieldErrors.dob) {
                              setFieldErrors(prev => ({ ...prev, dob: '' }));
                            }
                          }}
                          disabled={loading}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {fieldErrors.dob && (
                          <div className="invalid-feedback">
                            {fieldErrors.dob}
                          </div>
                        )}
                        <small className="text-muted">Patient must be at least 1 year old</small>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="m-t-20 text-center">
                    <button 
                      id="addPatient" 
                      type="submit" 
                      className="btn btn-primary submit-btn me-2" 
                      disabled={loading}
                      style={{ minWidth: '150px' }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} color="inherit" />
                          <span className="ms-2">Creating...</span>
                        </>
                      ) : (
                        'Create Patient'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary submit-btn" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <ErrorDialogueBox
          open={errorDialogueBoxOpen}
          handleToClose={handleDialogueClose}
          ErrorTitle="Error: Add Patient"
          ErrorList={errorList}
        />
        
        {/* Success Snackbar */}
        <Snackbar
          open={successSnackbar}
          autoHideDuration={3000}
          onClose={() => setSuccessSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccessSnackbar(false)} elevation={6}>
            Patient added successfully! Redirecting to patients list...
          </Alert>
        </Snackbar>
        
        {/* Error Snackbar */}
        <Snackbar
          open={errorSnackbar}
          autoHideDuration={6000}
          onClose={() => setErrorSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setErrorSnackbar(false)} elevation={6}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
}

export default AddPatient;