import React, { useState, useContext } from 'react';
import styles from './Appointment.module.css';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import { UserContext } from '../../Context/UserContext';
import Box from '@mui/material/Box';
import MyCalendar from '../Datepicker/MyCalendar';
import DoctorAppointmentTable from '../MUITable/DoctorAppointmentTable';
import useAppointments from '../../hooks/useAppointments';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import PrescriptionForm from '../Forms/PrescriptionForm';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

function DoctorAppointment() {
    const { currentUser } = useContext(UserContext);
    const doctorId = currentUser?.doctorId || currentUser?._id;
    
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prescriptionLoading, setPrescriptionLoading] = useState(false);

    const {
        date,
        setDate,
        availableSlots,
        bookedAppointments,
        doctorList,
        patientList,
        deleteBookedSlots,
        getAvailableSlots,
        getBookedSlots,
        formatDateForDateInput,
        getformDate,
        loading
    } = useAppointments('doctor', doctorId);

    const handleErrorDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    };

    // Handle opening prescription dialog
    const handleWritePrescription = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenPrescriptionDialog(true);
    };

    // Handle saving prescription
    const handleSavePrescription = async (event, prescriptionData) => {
        event.preventDefault();
        setPrescriptionLoading(true);
        
        try {
            const response = await axios.post('https://hospital-management-system-2-dni5.onrender.com/prescriptions', prescriptionData, {
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.message === "success") {
                // Close dialog and refresh appointments
                setOpenPrescriptionDialog(false);
                setSelectedAppointment(null);
                await getBookedSlots(); // Refresh appointments
                return Promise.resolve();
            } else {
                throw new Error(response.data.message || 'Failed to save prescription');
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            setErrorList([error.response?.data?.message || error.message || 'Failed to save prescription']);
            setErrorDialogueBoxOpen(true);
            throw error;
        } finally {
            setPrescriptionLoading(false);
        }
    };

    // Get patient name from appointment
    const getPatientName = (appointment) => {
        if (appointment?.patientId?.userId) {
            return `${appointment.patientId.userId.firstName || ''} ${appointment.patientId.userId.lastName || ''}`.trim();
        }
        return 'Unknown Patient';
    };

    return (
        <Box id={styles.appointmentMain} component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div>
                <h3 className={styles.pageTitle}>My Appointments Schedule</h3>
            </div>

            <div id={styles.slotGrid}>
                <div id={styles.calendarDiv}>
                    <MyCalendar date={date} setDate={setDate} />
                </div>
                
                <div id={styles.slotCreationDiv}>
                    <div className="doctor-info-card">
                        <h4>Welcome, Dr. {currentUser?.firstName} {currentUser?.lastName}</h4>
                        <p>Manage your appointments and schedule below</p>
                    </div>
                    
                    <div className='mt-4 row'>
                        <div className="col-12">
                            <label htmlFor="appDate" className="col-sm-3 col-form-label fw-bold">Select Date: </label>
                            <input 
                                id="appDate" 
                                name="appDate" 
                                type="date" 
                                className="col-form-control col-sm-7"
                                value={formatDateForDateInput(date)}
                                onChange={(e) => setDate(getformDate(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className='row mt-4'>
                        {availableSlots.length > 0 && (
                            <div className={styles.availableSlotsHeader}>
                                <h4 className="mt-3">Available Slots for {formatDateForDateInput(date)}</h4>
                                <div className='d-flex flex-wrap'>
                                    {loading ? (
                                        <p>Loading slots...</p>
                                    ) : (
                                        availableSlots.map(slot => (
                                            <div key={slot} className={styles.slotCardDisabled}>
                                                {slot}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {!loading && availableSlots.length === 0 && (
                            <div className="alert alert-info mt-3">
                                <i className="fa fa-info-circle"></i> No available slots for the selected date. Please check another date.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {bookedAppointments.length > 0 && (
                <div className={styles.availableSlotsHeader}>
                    <h4 className="mt-5">My Scheduled Appointments</h4>
                    <DoctorAppointmentTable
                        bookedAppointments={bookedAppointments}
                        deleteBookedSlots={deleteBookedSlots}
                        doctorList={doctorList}
                        patientList={patientList}
                        availableSlots={availableSlots}
                        getAvailableSlots={getAvailableSlots}
                        getBookedSlots={getBookedSlots}
                        onWritePrescription={handleWritePrescription}
                    />
                </div>
            )}

            {!loading && bookedAppointments.length === 0 && availableSlots.length === 0 && (
                <div className="text-center mt-5 p-5 bg-light rounded">
                    <i className="fa fa-calendar-check-o fa-3x text-success mb-3"></i>
                    <h5>No appointments scheduled for this date</h5>
                    <p className="text-muted">Select a different date to view your schedule</p>
                </div>
            )}

            {/* Prescription Dialog */}
            <Dialog 
                open={openPrescriptionDialog} 
                onClose={() => setOpenPrescriptionDialog(false)} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>
                    Create Prescription for {selectedAppointment && getPatientName(selectedAppointment)}
                </DialogTitle>
                <DialogContent>
                    {selectedAppointment && (
                        <PrescriptionForm
                            formName="prescriptionForm"
                            appointmentId={selectedAppointment._id}
                            patientSelected={selectedAppointment.patientId?._id}
                            patientName={getPatientName(selectedAppointment)}
                            patientList={patientList}
                            doctorId={doctorId}
                            formOnSubmit={handleSavePrescription}
                            onCancel={() => setOpenPrescriptionDialog(false)}
                            onSuccess={() => {
                                setOpenPrescriptionDialog(false);
                                getBookedSlots(); // Refresh appointments
                            }}
                            prescriptionLoading={prescriptionLoading}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Optional: Show loading indicator while saving prescription */}
            {prescriptionLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <CircularProgress />
                    <span style={{ color: 'white', marginLeft: '10px' }}>Saving prescription...</span>
                </div>
            )}

            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleErrorDialogueClose}
                ErrorTitle="Error"
                ErrorList={errorList}
            />
        </Box>
    );
}

export default DoctorAppointment;