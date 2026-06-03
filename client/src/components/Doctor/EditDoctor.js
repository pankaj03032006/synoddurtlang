import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom"; // Removed unused NavLink
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import axios from "axios";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
// Removed unused Material-UI imports: TextField, MenuItem, Select, FormControl, InputLabel, FormHelperText

function Editdoctor() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  
  // Validation state
  const [passwordMatchDisplay, setPasswordMatchDisplay] = useState('none');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  // Department list
  const departmentList = [
    'Cardiology',
    'Gynecology', 
    'Hematology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'Emergency Medicine',
    'Oncology',
    'Dermatology',
    'Psychiatry',
    'Urology'
  ];

  const handleDialogueOpen = () => setErrorDialogueBoxOpen(true);
  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false);
  };

  const handleSuccessClose = () => setSuccessSnackbar(false);

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUsername = (username) => {
    return username.length >= 3;
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return phone ? re.test(phone) : true;
  };

  // Fetch doctor data - wrapped in useCallback
  const getdoctorById = useCallback(async () => {
    setFetchingData(true);
    try {
      const response = await axios.get(`https://hospital-management-system-2-dni5.onrender.com/doctors/${id}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const doctorData = response.data;
      setFirstName(doctorData.userId?.firstName || '');
      setLastName(doctorData.userId?.lastName || '');
      setEmail(doctorData.userId?.email || '');
      setUsername(doctorData.userId?.username || '');
      setPhone(doctorData.phone || '');
      setDepartment(doctorData.department || '');
      setUserId(doctorData.userId?._id || '');
      // Don't set password fields for security
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error fetching doctor:", error);
      setErrorList([error.response?.data?.message || "Failed to fetch doctor details"]);
      handleDialogueOpen();
      setTimeout(() => navigate("/doctors"), 2000);
    } finally {
      setFetchingData(false);
    }
  }, [id, navigate]); // Added dependencies

  // Update doctor
  const updatedoctor = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = [];
    
    if (!firstName.trim()) validationErrors.push('First name is required');
    if (!lastName.trim()) validationErrors.push('Last name is required');
    if (!username.trim()) validationErrors.push('Username is required');
    if (username.trim() && !validateUsername(username)) validationErrors.push('Username must be at least 3 characters');
    if (!email.trim()) validationErrors.push('Email is required');
    if (email.trim() && !validateEmail(email)) validationErrors.push('Please enter a valid email address');
    if (showPasswordFields && password && password.length <= 6) validationErrors.push('Password must be greater than 6 characters');
    if (showPasswordFields && password !== confirmPassword) validationErrors.push('Passwords do not match');
    if (phone && !validatePhone(phone)) validationErrors.push('Phone number must be 10 digits');
    
    if (validationErrors.length > 0) {
      setErrorList(validationErrors);
      handleDialogueOpen();
      return;
    }
    
    setLoading(true);
    
    try {
      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department,
        userId
      };
      
      // Only include password if it's being changed
      if (showPasswordFields && password) {
        updateData.password = password;
        updateData.confirmPassword = confirmPassword;
      }
      
      await axios.patch(`https://hospital-management-system-2-dni5.onrender.com/doctors/${id}`, updateData, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      setSuccessSnackbar(true);
      setTimeout(() => {
        navigate("/doctors");
      }, 1500);
    } catch (error) {
      console.error("Error updating doctor:", error);
      setErrorList(error.response?.data?.errors || [error.response?.data?.message || "Failed to update doctor"]);
      handleDialogueOpen();
    } finally {
      setLoading(false);
    }
  };

  // Validation effects
  useEffect(() => {
    if (showPasswordFields && password && password.length > 0 && password.trim().length <= 6) {
      setPasswordValidationMessage('Password must be greater than 6 characters');
    } else {
      setPasswordValidationMessage('');
    }
    
    if (showPasswordFields && password && confirmPassword) {
      if (password === confirmPassword) {
        setPasswordMatchDisplay('none');
      } else {
        setPasswordMatchDisplay('block');
      }
    } else {
      setPasswordMatchDisplay('none');
    }
  }, [password, confirmPassword, showPasswordFields]);

  useEffect(() => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (username && !validateUsername(username)) {
      setUsernameError('Username must be at least 3 characters');
    } else {
      setUsernameError('');
    }
  }, [username]);

  useEffect(() => {
    if (phone && !validatePhone(phone)) {
      setPhoneError('Phone number must be 10 digits');
    } else {
      setPhoneError('');
    }
  }, [phone]);

  // Fixed useEffect with correct dependency
  useEffect(() => {
    if (id) {
      getdoctorById();
    }
  }, [id, getdoctorById]); // Added getdoctorById to dependencies

  if (fetchingData) {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="text-center">
          <CircularProgress />
          <p className="mt-3 text-muted">Loading doctor details...</p>
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
                <h3 className="page-title">Edit Doctor</h3>
                <p className="text-muted">Update doctor information below</p>
                <hr />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <form id="editdoctorForm" name='editdoctorForm' onSubmit={updatedoctor}>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>First Name <span className="text-danger">*</span></label>
                        <input 
                          name="firstName" 
                          className="form-control" 
                          type="text" 
                          required 
                          value={firstName} 
                          onChange={(event) => setFirstName(event.target.value)} 
                          placeholder="Enter first name"
                        />
                      </div>
                    </div>
                    
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Last Name <span className="text-danger">*</span></label>
                        <input 
                          name="lastName" 
                          className="form-control" 
                          type="text" 
                          required 
                          value={lastName} 
                          onChange={(event) => setLastName(event.target.value)} 
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Username <span className="text-danger">*</span></label>
                        <input 
                          name="username" 
                          className="form-control" 
                          type="text" 
                          required 
                          value={username} 
                          onChange={(event) => setUsername(event.target.value)} 
                          placeholder="Choose a username"
                        />
                        {usernameError && (
                          <small className="text-danger">{usernameError}</small>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Email <span className="text-danger">*</span></label>
                        <input 
                          name="email" 
                          className="form-control" 
                          type="email" 
                          required 
                          value={email} 
                          onChange={(event) => setEmail(event.target.value)} 
                          placeholder="doctor@hospital.com"
                        />
                        {emailError && (
                          <small className="text-danger">{emailError}</small>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                          name="phone" 
                          className="form-control" 
                          type="tel" 
                          value={phone} 
                          onChange={(event) => setPhone(event.target.value)} 
                          placeholder="10-digit mobile number"
                        />
                        {phoneError && (
                          <small className="text-danger">{phoneError}</small>
                        )}
                        <small className="text-muted">Optional, 10 digits only</small>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Department <span className="text-danger">*</span></label>
                        <select 
                          name="department" 
                          className="form-select" 
                          value={department} 
                          onChange={(event) => setDepartment(event.target.value)}
                          required
                        >
                          {departmentList.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="col-12">
                      <div className="form-group">
                        <button 
                          type="button" 
                          className="btn btn-link ps-0"
                          onClick={() => setShowPasswordFields(!showPasswordFields)}
                        >
                          {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                        </button>
                      </div>
                    </div>

                    {showPasswordFields && (
                      <>
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>New Password</label>
                            <input 
                              name="password" 
                              className="form-control" 
                              type="password" 
                              value={password} 
                              onChange={(event) => setPassword(event.target.value)} 
                              placeholder="Leave blank to keep current password"
                            />
                            {passwordValidationMessage && (
                              <small className="text-warning">{passwordValidationMessage}</small>
                            )}
                          </div>
                        </div>
                        
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                              name="confirmPassword" 
                              className="form-control" 
                              type="password" 
                              value={confirmPassword} 
                              onChange={(event) => setConfirmPassword(event.target.value)} 
                              placeholder="Re-enter new password"
                            />
                            <div style={{ display: passwordMatchDisplay }}>
                              <small className="text-danger">Passwords do not match!</small>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="m-t-20 text-center">
                    <button 
                      type="submit" 
                      className="btn btn-primary submit-btn" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} color="inherit" />
                          <span className="ms-2">Updating...</span>
                        </>
                      ) : (
                        'Update Doctor'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary ms-2" 
                      onClick={() => navigate("/doctors")}
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
          ErrorTitle="Error: Edit Doctor"
          ErrorList={errorList}
        />
        
        <Snackbar
          open={successSnackbar}
          autoHideDuration={1500}
          onClose={handleSuccessClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSuccessClose} severity="success" sx={{ width: '100%' }}>
            Doctor updated successfully! Redirecting...
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
}

export default Editdoctor;