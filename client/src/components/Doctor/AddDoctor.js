import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

function Adddoctor() {
  const navigate = useNavigate();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  
  // Validation state
  const [passwordMatchDisplay, setPasswordMatchDisplay] = useState('none');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  // UI state
  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  
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
    'Dermatology'
  ];

  const handleDialogueOpen = () => setErrorDialogueBoxOpen(true);
  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false);
  };

  const handleSuccessSnackbarClose = () => setSuccessSnackbar(false);

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Username validation
  const validateUsername = (username) => {
    return username.length >= 3;
  };

  // Phone validation
  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return phone ? re.test(phone) : true;
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!firstName.trim()) errors.push('First name is required');
    if (!lastName.trim()) errors.push('Last name is required');
    if (!username.trim()) errors.push('Username is required');
    if (username.trim() && !validateUsername(username)) errors.push('Username must be at least 3 characters');
    if (!email.trim()) errors.push('Email is required');
    if (email.trim() && !validateEmail(email)) errors.push('Please enter a valid email address');
    if (!password) errors.push('Password is required');
    if (password && password.length <= 6) errors.push('Password must be greater than 6 characters');
    if (password !== confirmPassword) errors.push('Passwords do not match');
    if (phone && !validatePhone(phone)) errors.push('Phone number must be 10 digits');
    
    return errors;
  };

  const adddoctor = async (event) => {
    event.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrorList(validationErrors);
      handleDialogueOpen();
      return;
    }
    
    setLoading(true);
    
    const doctor = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password,
      confirmPassword: confirmPassword,
      department: department
    };

    try {
      // CHANGED: Back to port 3001 (where your backend actually runs)
      const API_URL = 'https://hospital-management-system-2-dni5.onrender.com/doctors';
      console.log('Sending POST request to:', API_URL);
      console.log('Doctor data:', doctor);
      
      const response = await axios.post(API_URL, doctor, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data.message === "success") {
        setSuccessSnackbar(true);
        setTimeout(() => {
          navigate("/doctors");
        }, 1500);
      } else {
        setErrorList(response.data.errors || ["Failed to add doctor"]);
        handleDialogueOpen();
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 404) {
          setErrorList(['Backend route not found. Make sure backend is running on port 3001']);
        } else if (error.response.status === 401) {
          setErrorList(['Authentication required. Please login again.']);
        } else if (error.response.status === 400) {
          setErrorList(error.response.data.errors || ['Invalid data provided']);
        } else {
          setErrorList([`Server error: ${error.response.status}`]);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setErrorList(['Cannot connect to backend. Make sure backend is running on port 3001']);
      } else {
        // Something else happened
        setErrorList([error.message]);
      }
      handleDialogueOpen();
    } finally {
      setLoading(false);
    }
  };

  // Validation effects
  useEffect(() => {
    if (password.length > 0 && password?.trim()?.length <= 6) {
      setPasswordValidationMessage('Password must be greater than 6 characters');
    } else {
      setPasswordValidationMessage('');
    }
    
    if (password === confirmPassword && confirmPassword.length > 0) {
      setPasswordMatchDisplay('none');
    } else if (confirmPassword.length > 0) {
      setPasswordMatchDisplay('block');
    } else {
      setPasswordMatchDisplay('none');
    }
  }, [password, confirmPassword]);

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

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div className="page-wrapper">
        <div className="content">
          <div className="card-box">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h4 className="page-title">Add New Doctor</h4>
                <p className="text-muted">Fill in the details below to register a new doctor</p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <form id="adddoctorForm" name='adddoctorForm' onSubmit={adddoctor}>
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
                        <label>Password <span className="text-danger">*</span></label>
                        <input 
                          name="password" 
                          className="form-control" 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(event) => setPassword(event.target.value)} 
                          placeholder="Min. 6 characters"
                        />
                        {passwordValidationMessage && (
                          <small className="text-warning">{passwordValidationMessage}</small>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Confirm Password <span className="text-danger">*</span></label>
                        <input 
                          name="confirmPassword" 
                          className="form-control" 
                          type="password" 
                          required 
                          value={confirmPassword} 
                          onChange={(event) => setConfirmPassword(event.target.value)} 
                          placeholder="Re-enter password"
                        />
                        <div style={{ display: passwordMatchDisplay }}>
                          <small className="text-danger">Passwords do not match!</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Phone Number </label>
                        <input 
                          name="phone" 
                          className="form-control" 
                          type="tel" 
                          value={phone} 
                          onChange={(event) => setPhone(event.target.value)} 
                          placeholder="10-digit mobile number"
                        />
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
                  </div>

                  <div className="m-t-20 text-center">
                    <button 
                      id="adddoctor" 
                      type="submit" 
                      className="btn btn-primary submit-btn" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} color="inherit" />
                          <span className="ms-2">Creating Doctor...</span>
                        </>
                      ) : (
                        'Create Doctor'
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
          ErrorTitle="Error: Add Doctor"
          ErrorList={errorList}
        />
        
        <Snackbar
          open={successSnackbar}
          autoHideDuration={1500}
          onClose={handleSuccessSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSuccessSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Doctor added successfully! Redirecting...
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
}

export default Adddoctor;