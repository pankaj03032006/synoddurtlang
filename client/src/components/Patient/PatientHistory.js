import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import moment from 'moment';
import PrescriptionTable from '../MUITable/PrescriptionTable';

function PatientHistory() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDOB] = useState('');
  const [patientId, setPatientId] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorSnackbar, setErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getPatientById = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/patients/${id}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      setPatientId(response.data._id);
      setFirstName(response.data.userId?.firstName || '');
      setLastName(response.data.userId?.lastName || '');
      setEmail(response.data.userId?.email || '');
      setUsername(response.data.userId?.username || '');
      setPhone(response.data.phone || '');
      setAddress(response.data.address || '');
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
      setErrorMessage(errorMsg);
      setErrorSnackbar(true);
      
      // Navigate back after a short delay if patient not found
      setTimeout(() => {
        navigate("/patients");
      }, 2000);
    } finally {
      setFetchLoading(false);
    }
  }, [id, navigate]);

  const getHistory = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/patients/history/${patientId}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data.message === "success") {
        let respPrescription = response.data.prescriptions || [];
        
        // Sort prescriptions by date and time (most recent first)
        const sortedPrescriptions = respPrescription.sort((a, b) => {
          const dateA = a.appointmentId?.appointmentDate;
          const dateB = b.appointmentId?.appointmentDate;
          const timeA = a.appointmentId?.appointmentTime;
          const timeB = b.appointmentId?.appointmentTime;
          
          if (!dateA || !dateB) return 0;
          
          const datetimeA = new Date(`${moment(dateA).format('YYYY-MM-DD')} ${timeA}`);
          const datetimeB = new Date(`${moment(dateB).format('YYYY-MM-DD')} ${timeB}`);
          
          return datetimeB - datetimeA;
        });
        
        setPrescriptions(sortedPrescriptions);
      } else {
        setErrorMessage(response.data.message || "Failed to load patient history");
        setErrorSnackbar(true);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load patient history");
      setErrorSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    getPatientById();
  }, [getPatientById]);

  useEffect(() => {
    if (patientId) {
      getHistory();
    }
  }, [patientId, getHistory]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return moment(date).format('DD/MM/YYYY');
  };

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
          <div className="mt-3">
            <div className="row">
              <div className="col-lg-8">
                <h3 className="px-3 mx-3 my-2">Patient Profile</h3>
                <p className="px-3 mx-3 text-muted">View patient information and medical history</p>
              </div>
            </div>
            
            <div className="row mt-3">
              <div className="col-lg-10 px-4 mx-4">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      {/* First Name */}
                      <div className="col-sm-6 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">First Name <span className="text-danger">*</span></label>
                          <input 
                            name="firstName" 
                            className="form-control bg-light" 
                            type="text" 
                            disabled 
                            value={firstName} 
                          />
                        </div>
                      </div>
                      
                      {/* Last Name */}
                      <div className="col-sm-6 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">Last Name</label>
                          <input 
                            name="lastName" 
                            className="form-control bg-light" 
                            type="text" 
                            disabled 
                            value={lastName} 
                          />
                        </div>
                      </div>
                      
                      {/* Username */}
                      <div className="col-sm-6 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">Username <span className="text-danger">*</span></label>
                          <input 
                            name="username" 
                            className="form-control bg-light" 
                            type="text" 
                            disabled 
                            value={username} 
                          />
                        </div>
                      </div>
                      
                      {/* Email */}
                      <div className="col-sm-6 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">Email <span className="text-danger">*</span></label>
                          <input 
                            name="email" 
                            className="form-control bg-light" 
                            type="email" 
                            disabled 
                            value={email} 
                          />
                        </div>
                      </div>
                      
                      {/* Phone */}
                      <div className="col-sm-6 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">Phone</label>
                          <input 
                            name="phone" 
                            className="form-control bg-light" 
                            type="text" 
                            disabled 
                            value={phone || 'N/A'} 
                          />
                        </div>
                      </div>
                      
                      {/* Gender */}
                      <div className="col-sm-6 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">Gender</label>
                          <input 
                            name="gender" 
                            className="form-control bg-light" 
                            type="text" 
                            disabled 
                            value={gender || 'N/A'} 
                          />
                        </div>
                      </div>
                      
                      {/* Date of Birth */}
                      <div className="col-sm-6 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">Date of Birth</label>
                          <input 
                            name="dob" 
                            className="form-control bg-light" 
                            type="text" 
                            disabled 
                            value={formatDate(dob)} 
                          />
                        </div>
                      </div>
                      
                      {/* Address */}
                      <div className="col-sm-12 mb-3">
                        <div className="form-group">
                          <label className="fw-bold">Address</label>
                          <textarea 
                            name="address" 
                            className="form-control bg-light" 
                            disabled 
                            rows="3"
                            value={address || 'N/A'} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="p-3 m-3">Patient Medical History</h3>
          {loading ? (
            <div className="text-center py-5">
              <CircularProgress size={40} />
              <p className="mt-3 text-muted">Loading prescription history...</p>
            </div>
          ) : (
            <PrescriptionTable prescriptionList={prescriptions} loading={loading} />
          )}
        </div>
      </div>
      
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
    </Box>
  );
}

export default PatientHistory;