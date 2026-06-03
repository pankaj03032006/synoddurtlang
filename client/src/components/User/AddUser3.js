import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';

function AddUser() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [passwordMatchDisplay, setPasswordMatchDisplay] = useState('none');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);
  
  const handleDialogueOpen = () => {
    setErrorDialogueBoxOpen(true)
  };
  
  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false)
  };

  const addUser = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorList(["Password and Confirm Password do not match"]);
      handleDialogueOpen();
      return;
    }
    
    if (password.trim().length <= 6) {
      setErrorList(["Password length must be greater than 6 characters"]);
      handleDialogueOpen();
      return;
    }
    
    if (!firstName || !lastName || !username || !email || !userType) {
      setErrorList(["Please fill in all required fields"]);
      handleDialogueOpen();
      return;
    }
    
    setIsSubmitting(true);
    
    let user = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      userType: userType
    };
    
    try {
      const response = await fetch('https://hospital-management-system-2-dni5.onrender.com/users', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(user)
      });
      
      const data = await response.json();
      
      if (response.ok && data.message === "success") {
        navigate("/users");
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setErrorList(data.errors);
        } else if (data.message) {
          setErrorList([data.message]);
        } else {
          setErrorList(["An error occurred while creating the user"]);
        }
        handleDialogueOpen();
      }
    } catch (error) {
      console.error("Add user error:", error);
      setErrorList([error.message || "Failed to connect to server"]);
      handleDialogueOpen();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (password && password.trim().length > 0 && password.trim().length <= 6) {
      setPasswordValidationMessage('Password Length must be greater than 6 characters');
    } else {
      setPasswordValidationMessage('');
    }
    
    if (password === confirmPassword) {
      setPasswordMatchDisplay('none');
    } else {
      setPasswordMatchDisplay('block');
    }
  }, [password, confirmPassword]);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div className="page-wrapper">
        <div className="content">
          <div className="card-box">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h4 className="page-title">Add User</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <form id="addUserForm" name='addUserForm' onSubmit={addUser}>
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
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Last Name</label>
                        <input 
                          name="lastName" 
                          className="form-control" 
                          type="text" 
                          required 
                          value={lastName} 
                          onChange={(event) => setLastName(event.target.value)}
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        />
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
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Password</label>
                        <input 
                          name="password" 
                          className="form-control" 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={isSubmitting}
                        />
                        {passwordValidationMessage && (
                          <small className="text-danger">{passwordValidationMessage}</small>
                        )}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                          name="confirmPassword" 
                          className="form-control" 
                          type="password" 
                          required 
                          value={confirmPassword} 
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          disabled={isSubmitting}
                        />
                        <small className="text-danger" style={{ display: passwordMatchDisplay }}>
                          Passwords do not match
                        </small>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Role</label>
                        <select 
                          name="userType" 
                          className="form-select" 
                          value={userType} 
                          onChange={(event) => setUserType(event.target.value)}
                          disabled={isSubmitting}
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="Admin">Admin</option>
                          <option value="Doctor">Doctor</option>
                          <option value="Patient">Patient</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="m-t-20 text-center">
                    <button 
                      id="signUp" 
                      type="submit" 
                      className="btn btn-primary submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create User'}
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
          ErrorTitle="Error: Add User"
          ErrorList={errorList}
        />
      </div>
    </Box>
  )
}

export default AddUser;