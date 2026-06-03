import React, { useState, useContext } from 'react';
import styles from './Appointment.module.css';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import { UserContext } from '../../Context/UserContext';
import Box from '@mui/material/Box';
import MyCalendar from '../Datepicker/MyCalendar';
import axios from "axios";
import { BootstrapDialog, BootstrapDialogTitle } from "../MUIDialogueBox/BoostrapDialogueBox";
import DialogContent from '@mui/material/DialogContent';
import AppointmentForm from '../Forms/AppointmentForm';
import AppointmentTable from '../MUITable/AppointmentTable';
import useAppointments from '../../hooks/useAppointments';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

function PatientAppointment() {
    const { currentUser } = useContext(UserContext);
    const [clickedTimeSlot, setClickedTimeSlot] = useState('');
    const [openDialogueBox, setOpenDialogueBox] = useState(false);
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const [successSnackbar, setSuccessSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    const {
        date,
        setDate,
        availableSlots,
        bookedAppointments,
        departmentList,
        doctorList,
        patientList,
        departmentSelected,
        setDepartmentSelected,
        doctorSelected,
        setDoctorSelected,
        getAvailableSlots,
        getBookedSlots,
        deleteBookedSlots,
        formatDateForDateInput,
        getformDate,
        loading
    } = useAppointments('patient');

    const handleErrorDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    };

    const handleSuccessSnackbarClose = () => {
        setSuccessSnackbar(false);
        setSuccessMessage('');
    };

    const handleClickOpen = () => setOpenDialogueBox(true);
    const handleClose = () => {
        setOpenDialogueBox(false);
        setClickedTimeSlot('');
    };

    const handleDepartmentChange = (event) => {
        setDepartmentSelected(event.target.value);
        setDoctorSelected("");
    };

    const handleDoctorChange = (event) => {
        setDoctorSelected(event.target.value);
    };

    const addAppointmentFormSubmitted = async (event) => {
        event.preventDefault();
        
        console.log("=== BOOKING BUTTON CLICKED ===");
        
        const form = document.forms.addAppointment;
        
        if (!form) {
            console.error("Form 'addAppointment' not found!");
            setErrorList(["Form not found. Please refresh the page."]);
            setErrorDialogueBoxOpen(true);
            return;
        }
        
        console.log("Form values:", {
            appDate: form.appDate?.value,
            appTime: form.appTime?.value,
            doctor: form.doctor?.value,
            patient: form.patient?.value
        });
        
        // Validate form data
        if (!form.doctor?.value) {
            console.log("Validation failed: No doctor selected");
            setErrorList(["Please select a doctor"]);
            setErrorDialogueBoxOpen(true);
            return;
        }
        
        if (!form.appTime?.value) {
            console.log("Validation failed: No time slot selected");
            setErrorList(["Please select a time slot"]);
            setErrorDialogueBoxOpen(true);
            return;
        }
        
        // Get patient ID - try multiple possible locations
        const patientId = currentUser?.patientId || currentUser?._id || currentUser?.userId;
        console.log("Current user:", currentUser);
        console.log("Patient ID being used:", patientId);
        
        if (!patientId) {
            console.log("Validation failed: No patient ID found");
            setErrorList(["Patient information not found. Please login again."]);
            setErrorDialogueBoxOpen(true);
            return;
        }
        
        let reqObj = {
            "appDate": form.appDate.value,
            "appTime": form.appTime.value,
            "doctorId": form.doctor.value,
            "patientId": patientId
        };
        
        console.log("Request object:", reqObj);
        console.log("Token present:", !!localStorage.getItem("token"));
        
        setBookingLoading(true);
        
        try {
            console.log("Making API call to: https://hospital-management-system-2-dni5.onrender.com/appointments/");
            
            const response = await axios.put(`https://hospital-management-system-2-dni5.onrender.com/appointments/`, reqObj, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            console.log("Response status:", response.status);
            console.log("Response data:", response.data);
            
            if (response.data.message === "success") {
                console.log("SUCCESS: Appointment booked!");
                await Promise.all([getAvailableSlots(), getBookedSlots()]);
                handleClose();
                setSuccessMessage("Appointment booked successfully!");
                setSuccessSnackbar(true);
            } else {
                console.log("API returned error:", response.data.message);
                setErrorList([response.data.message || "Failed to book appointment"]);
                setErrorDialogueBoxOpen(true);
            }
        } catch (error) {
            console.error("=== ERROR IN API CALL ===");
            console.error("Error details:", error);
            
            if (error.response) {
                console.error("Error status:", error.response.status);
                console.error("Error data:", error.response.data);
                
                let errorMsg = "Failed to book appointment";
                if (error.response.data?.message) {
                    errorMsg = error.response.data.message;
                } else if (error.response.data?.errors?.length > 0) {
                    errorMsg = error.response.data.errors[0];
                } else if (error.response.status === 401) {
                    errorMsg = "Session expired. Please login again.";
                } else if (error.response.status === 404) {
                    errorMsg = "Backend endpoint not found. Please check if server is running.";
                } else if (error.response.status === 500) {
                    errorMsg = "Server error. Please check backend console.";
                }
                
                setErrorList([errorMsg]);
            } else if (error.request) {
                console.error("No response received");
                setErrorList(["Cannot connect to server. Please check if backend is running on port 3001"]);
            } else {
                console.error("Error message:", error.message);
                setErrorList([error.message || "An error occurred while booking the appointment"]);
            }
            setErrorDialogueBoxOpen(true);
        } finally {
            setBookingLoading(false);
            console.log("=== BOOKING PROCESS COMPLETED ===");
        }
    };

    const slotClicked = (slot) => {
        console.log("Slot clicked:", slot);
        if (!doctorSelected) {
            setErrorList(["Please select a doctor first"]);
            setErrorDialogueBoxOpen(true);
            return;
        }
        setClickedTimeSlot(slot);
        handleClickOpen();
    };

    return (
        <Box id={styles.appointmentMain} component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div>
                <h3 className={styles.pageTitle}>Book an Appointment</h3>
                <p className="text-muted">Schedule your visit with our expert doctors</p>
            </div>

            <div id={styles.slotGrid}>
                <div id={styles.calendarDiv}>
                    <MyCalendar date={date} setDate={setDate} />
                </div>
                
                <div id={styles.slotCreationDiv}>
                    <div className="patient-info-card mb-4">
                        <h4>Welcome, {currentUser?.firstName} {currentUser?.lastName}</h4>
                        <p>Select a department, doctor, and time slot to book your appointment</p>
                    </div>
                    
                    <div className='my-4 row'>
                        <div className='col-12'>
                            <label htmlFor="department" className="col-sm-3 col-form-label fw-bold">Department: </label>
                            <select 
                                name="department" 
                                id="department" 
                                className="col-form-select col-sm-7" 
                                aria-label="Select department" 
                                onChange={handleDepartmentChange}
                                value={departmentSelected}
                            >
                                <option value=''>Select Department</option>
                                {departmentList.map(sp => (
                                    <option key={sp} value={sp}>{sp}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='my-4 row'>
                        <div className='col-12'>
                            <label htmlFor="doctor" className="col-sm-3 col-form-label fw-bold">Doctor: </label>
                            <select 
                                name="doctor" 
                                id="doctor" 
                                className="col-form-select col-sm-7" 
                                aria-label="Select doctor" 
                                required
                                onChange={handleDoctorChange}
                                value={doctorSelected}
                                disabled={!departmentSelected}
                            >
                                <option value=''>Select Doctor</option>
                                {doctorList.map(doctor => (
                                    <option key={doctor._id} value={doctor._id}>
                                        Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} - {doctor.department}
                                    </option>
                                ))}
                            </select>
                            {!departmentSelected && (
                                <small className="text-muted d-block mt-2">Please select a department first</small>
                            )}
                        </div>
                    </div>

                    <div className='mt-4 row'>
                        <div className="col-12">
                            <label htmlFor="appDate" className="col-sm-3 col-form-label fw-bold">Date: </label>
                            <input 
                                id="appDate" 
                                name="appDate" 
                                type="date" 
                                className="col-form-control col-sm-7"
                                value={formatDateForDateInput(date)}
                                onChange={(e) => setDate(getformDate(e.target.value))}
                                min={formatDateForDateInput(new Date())}
                            />
                        </div>
                    </div>

                    <div className='row mt-4'>
                        {availableSlots.length > 0 && (
                            <div className={styles.availableSlotsHeader}>
                                <h4 className="mt-3">Available Time Slots</h4>
                                <p>Click on any slot to book your appointment</p>
                                <div className='d-flex flex-wrap'>
                                    {loading ? (
                                        <p>Loading available slots...</p>
                                    ) : (
                                        availableSlots.map(slot => (
                                            <div key={slot} onClick={() => slotClicked(slot)} className={styles.slotCard}>
                                                {slot}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {!loading && doctorSelected && availableSlots.length === 0 && (
                            <div className="alert alert-warning mt-3">
                                <i className="fa fa-exclamation-triangle"></i> No available slots for the selected doctor and date. Please try another date.
                            </div>
                        )}
                        
                        {!loading && !doctorSelected && (
                            <div className="alert alert-info mt-3">
                                <i className="fa fa-info-circle"></i> Please select a doctor to view available time slots.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {bookedAppointments.length > 0 && (
                <div className={styles.availableSlotsHeader}>
                    <h4 className="mt-5">My Upcoming Appointments</h4>
                    <AppointmentTable
                        bookedAppointments={bookedAppointments}
                        deleteBookedSlots={deleteBookedSlots}
                        doctorList={doctorList}
                        patientList={patientList}
                        availableSlots={availableSlots}
                        getAvailableSlots={getAvailableSlots}
                        getBookedSlots={getBookedSlots}
                    />
                </div>
            )}

            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleErrorDialogueClose}
                ErrorTitle="Booking Error"
                ErrorList={errorList}
            />

            <Snackbar
                open={successSnackbar}
                autoHideDuration={3000}
                onClose={handleSuccessSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSuccessSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <BootstrapDialog onClose={handleClose} open={openDialogueBox} maxWidth="md" fullWidth>
                <BootstrapDialogTitle onClose={handleClose}>
                    Confirm Appointment Booking
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {bookingLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <CircularProgress />
                            <p style={{ marginTop: '20px' }}>Booking your appointment...</p>
                        </div>
                    ) : (
                        <AppointmentForm
                            formName="addAppointment"
                            formOnSubmit={addAppointmentFormSubmitted}
                            appDate={formatDateForDateInput(date)}
                            appTime={clickedTimeSlot}
                            doctorList={doctorList}
                            doctorSelected={doctorSelected}
                            patientList={patientList}
                            availableSlots={availableSlots}
                        />
                    )}
                </DialogContent>
            </BootstrapDialog>
        </Box>
    );
}

export default PatientAppointment;