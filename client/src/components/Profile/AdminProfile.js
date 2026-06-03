import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import axios from "axios";
import Box from '@mui/material/Box';
import { UserContext } from '../../Context/UserContext'

function AdminProfile() {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [passwordMatchDisplay, setPasswordMatchDisplay] = useState('none');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [loading, setLoading] = useState(false);
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

  const getAdminById = useCallback(async () => {
    if (!currentUser?.userId) {
      const errorMessage = "User information not available";
      setErrorList([errorMessage]);
      handleDialogueOpen();
      return;
    }

    setLoading(true);
    try {
      let adminUserId = currentUser.userId;
      const response = await axios.get(`https://hospital-management-system-2-dni5.onrender.com/profile/admin/${adminUserId}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      setUserId(response.data._id);
      setFirstName(response.data.firstName || '');
      setLastName(response.data.lastName || '');
      setEmail(response.data.email || '');
      setUsername(response.data.username || '');
      setPassword(response.data.password || '');
      setConfirmPassword(response.data.password || '');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch admin profile";
      setErrorList([errorMessage]);
      handleDialogueOpen();
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    getAdminById();
  }, [getAdminById]);

  const updateAdmin = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorList(["Password and Confirm Password do not match"]);
      handleDialogueOpen();
      return;
    }
    
    if (password && password.trim().length <= 6) {
      setErrorList(["Password length must be greater than 6 characters"]);
      handleDialogueOpen();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await axios.patch(`https://hospital-management-system-2-dni5.onrender.com/profile/admin/${userId}`, {
        firstName,
        lastName,
        username,
        email,
        password: password || undefined,
        confirmPassword: confirmPassword || undefined
      }, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      navigate("/profile");
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.data?.errors) {
        setErrorList(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrorList([error.response.data.message]);
      } else {
        setErrorList([error.message || "Failed to update profile"]);
      }
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

  if (loading) {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <div className="page-wrapper">
          <div className="content">
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p>Loading profile...</p>
            </div>
          </div>
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
                <h3 className="page-title">Update Profile</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <form id="addAdminForm" name='addAdminForm' onSubmit={updateAdmin}>
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
                          value={confirmPassword} 
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          disabled={isSubmitting}
                        />
                        <small className="text-danger" style={{ display: passwordMatchDisplay }}>
                          Passwords do not match
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="m-t-20 text-center">
                    <button 
                      type="submit" 
                      className="btn btn-primary submit-btn" 
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
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
          ErrorTitle="Error: Edit Admin"
          ErrorList={errorList}
        />
      </div>
    </Box>
  )
}

export default AdminProfile;