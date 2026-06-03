import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';

function EditPatient() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDOB] = useState('');
  const [userId, setUserId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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

  const getPatientById = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/patients/${id}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      setFirstName(response.data.userId?.firstName || '');
      setLastName(response.data.userId?.lastName || '');
      setEmail(response.data.userId?.email || '');
      setUsername(response.data.userId?.username || '');
      setPassword('');
      setConfirmPassword('');
      setPhone(response.data.phone || '');
      setAddress(response.data.address || '');
      setUserId(response.data.userId?._id || '');
      setGender(response.data.gender || '');
      setDOB(response.data.dob || '');
    } catch (error) {
      console.error("Error fetching patient:", error);
      let errorMsg = "Failed to load patient details";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setErrorList([errorMsg]);
      handleDialogueOpen();
      
      // Navigate back after a short delay if patient not found
      setTimeout(() => {
        navigate("/patients");
      }, 2000);
    } finally {
      setFetchLoading(false);
    }
  }, [id, navigate, handleDialogueOpen]);

  useEffect(() => {
    getPatientById();
  }, [getPatientById]);

  const updatePatient = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const patientData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password || undefined,
        confirmPassword: confirmPassword || undefined,
        address: address.trim(),
        gender: gender,
        dob: dob,
        userId
      };
      
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/patients/${id}`,
        patientData,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (response.data.message === "success") {
        setSuccessSnackbar(true);
        
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/patients");
        }, 1500);
      } else {
        // Display error message
        if (response.data.errors && Array.isArray(response.data.errors)) {
          setErrorList(response.data.errors);
          handleDialogueOpen();
        } else if (response.data.message) {
          setErrorMessage(response.data.message);
          setErrorSnackbar(true);
        } else {
          setErrorMessage("Failed to update patient. Please try again.");
          setErrorSnackbar(true);
        }
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      
      if (error.response?.data?.errors) {
        setErrorList(error.response.data.errors);
        handleDialogueOpen();
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
        setErrorSnackbar(true);
      } else if (error.message) {
        setErrorMessage(error.message);
        setErrorSnackbar(true);
      } else {
        setErrorMessage("Network error. Please check your connection and try again.");
        setErrorSnackbar(true);
      }
    } finally {
      setLoading(false);
    }
  };

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

  // Show loading indicator while fetching data
  if (fetchLoading) {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="text-center">
          <CircularProgress size={50} />
          <p className="mt-3 text-muted">Loading patient details...</p>
        </div>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div className="page-wrapper">
        <div className="content">
          <div className="card-box">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h3 className="page-title">Edit Patient</h3>
                <p className="text-muted">Update patient information</p>
              </div>
            </div>
            
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <form id="editPatientForm" name="editPatientForm" onSubmit={updatePatient}>
                  <div className="row">
                    {/* First Name */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>First Name <span className="text-danger">*</span></label>
                        <input 
                          name="firstName" 
                          className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`} 
                          type="text" 
                          required 
                          value={firstName} 
                          onChange={(event) => {
                            setFirstName(event.target.value);
                            if (fieldErrors.firstName) {
                              setFieldErrors(prev => ({ ...prev, firstName: '' }));
                            }
                          }}
                          disabled={loading}
                          placeholder="Enter first name"
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
                          required 
                          value={username} 
                          onChange={(event) => {
                            setUsername(event.target.value);
                            if (fieldErrors.username) {
                              setFieldErrors(prev => ({ ...prev, username: '' }));
                            }
                          }}
                          disabled={loading}
                          placeholder="Enter username"
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
                          required 
                          value={email} 
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (fieldErrors.email) {
                              setFieldErrors(prev => ({ ...prev, email: '' }));
                            }
                          }}
                          disabled={loading}
                          placeholder="Enter email address"
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
                            placeholder="Enter new password (leave blank to keep current)"
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
                        <small className="text-muted">Leave blank to keep current password. Must be at least 6 characters if changed.</small>
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
                            placeholder="Confirm new password"
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
                      type="submit" 
                      className="btn btn-primary submit-btn me-2" 
                      disabled={loading}
                      style={{ minWidth: '150px' }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} color="inherit" />
                          <span className="ms-2">Updating...</span>
                        </>
                      ) : (
                        'Update Patient'
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
          ErrorTitle="Error: Edit Patient"
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
            Patient updated successfully! Redirecting to patients list...
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

export default EditPatient;