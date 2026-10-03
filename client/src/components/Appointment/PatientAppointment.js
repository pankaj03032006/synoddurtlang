import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Button, FormControl, InputLabel,
    Select, MenuItem, TextField, Chip, Divider, Alert, Snackbar,
    CircularProgress, Grid, Stack,
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from "axios";

import styles from './Appointment.module.css';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import { UserContext } from '../../Context/UserContext';
import MyCalendar from '../Datepicker/MyCalendar';
import { BootstrapDialog, BootstrapDialogTitle } from '../MUIDialogueBox/BoostrapDialogueBox';
import DialogContent from '@mui/material/DialogContent';
import AppointmentForm from '../Forms/AppointmentForm';
import AppointmentTable from '../MUITable/AppointmentTable';
import useAppointments from '../../hooks/useAppointments';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const GREEN = '#31b372';
const GREEN_DARK = '#28995f';

function PatientAppointment() {
    const { currentUser } = useContext(UserContext);

    const [clickedTimeSlot, setClickedTimeSlot] = useState('');
    const [openDialogueBox, setOpenDialogueBox] = useState(false);
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const {
        date, setDate,
        availableSlots, bookedAppointments,
        departmentList, doctorList, patientList,
        departmentSelected, setDepartmentSelected,
        doctorSelected, setDoctorSelected,
        getAvailableSlots, getBookedSlots, deleteBookedSlots,
        formatDateForDateInput, getformDate, loading,
    } = useAppointments('patient');

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    const handleErrorDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    };

    const handleClickOpen = () => setOpenDialogueBox(true);
    const handleClose = () => {
        setOpenDialogueBox(false);
        setClickedTimeSlot('');
    };

    const handleDepartmentChange = (event) => {
        setDepartmentSelected(event.target.value);
        setDoctorSelected('');
    };

    const handleDoctorChange = (event) => {
        setDoctorSelected(event.target.value);
    };

    // ---------- SUBMIT BOOKING ----------
    const addAppointmentFormSubmitted = async (event) => {
        event.preventDefault();
        const form = document.forms.addAppointment;

        if (!form) {
            notify('error', 'Form not found. Please refresh the page.');
            return;
        }
        if (!form.doctor?.value) {
            notify('error', 'Please select a doctor.');
            return;
        }
        if (!form.appTime?.value) {
            notify('error', 'Please select a time slot.');
            return;
        }

        const patientId = currentUser?.patientId || currentUser?._id || currentUser?.userId;
        if (!patientId) {
            notify('error', 'Patient information not found. Please log in again.');
            return;
        }

        const reqObj = {
            appDate: form.appDate.value,
            appTime: form.appTime.value,
            doctorId: form.doctor.value,
            patientId,
        };

        setBookingLoading(true);
        try {
            const response = await axios.put(`${API}/appointments/`, reqObj, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.data.message === 'success') {
                await Promise.all([getAvailableSlots(), getBookedSlots()]);
                handleClose();
                notify('success', 'Appointment booked successfully!');
            } else {
                setErrorList([response.data.message || 'Failed to book appointment']);
                setErrorDialogueBoxOpen(true);
            }
        } catch (error) {
            const res = error.response;
            let msg = 'Failed to book appointment';
            if (res?.data?.errors?.length) msg = res.data.errors[0];
            else if (res?.data?.message) msg = res.data.message;
            else if (res?.status === 401) msg = 'Session expired. Please log in again.';
            else if (res?.status === 404) msg = 'Booking endpoint not found.';
            else if (res?.status === 500) msg = 'Server error. Please try again later.';
            else if (error.request) msg = 'Cannot reach the server. Check your connection.';
            else if (error.message) msg = error.message;

            setErrorList([msg]);
            setErrorDialogueBoxOpen(true);
        } finally {
            setBookingLoading(false);
        }
    };

    const slotClicked = (slot) => {
        if (!doctorSelected) {
            notify('error', 'Please select a doctor first.');
            return;
        }
        setClickedTimeSlot(slot);
        handleClickOpen();
    };

    return (
        <Box id={styles.appointmentMain} component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
            {/* ================= HEADER ================= */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: '50%',
                            bgcolor: 'rgba(49,179,114,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <MedicalServicesIcon sx={{ color: GREEN }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Book an Appointment
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Schedule your visit with our expert doctors.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ================= CALENDAR + BOOKING PANEL ================= */}
            <Grid2 container spacing={3} sx={{ mb: 3 }}>
                {/* Calendar */}
                <Grid2 item xs={12} md={5} lg={4}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', p: 1 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CalendarMonthIcon sx={{ color: GREEN }} />
                                <Typography variant="h6" fontWeight={700}>
                                    Select Date
                                </Typography>
                            </Box>
                            <MyCalendar date={date} setDate={setDate} />
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Booking panel */}
                <Grid2 item xs={12} md={7} lg={8}>
                    <Card
                        elevation={0}
                        sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}
                    >
                        {/* Welcome band */}
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                                color: '#fff',
                                px: { xs: 2, sm: 3 },
                                py: 2.5,
                            }}
                        >
                            <Typography variant="h6" fontWeight={700}>
                                Welcome, {currentUser?.firstName} {currentUser?.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Select a department, doctor, and time slot to book your appointment.
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            {/* Department + Doctor */}
                            <Grid2 container spacing={2}>
                                <Grid2 item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Department</InputLabel>
                                        <Select
                                            label="Department"
                                            value={departmentSelected}
                                            onChange={handleDepartmentChange}
                                        >
                                            <MenuItem value="">Select Department</MenuItem>
                                            {departmentList.map((sp) => (
                                                <MenuItem key={sp} value={sp}>{sp}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid2>

                                <Grid2 item xs={12} sm={6}>
                                    <FormControl fullWidth size="small" disabled={!departmentSelected}>
                                        <InputLabel>Doctor</InputLabel>
                                        <Select
                                            label="Doctor"
                                            value={doctorSelected}
                                            onChange={handleDoctorChange}
                                        >
                                            <MenuItem value="">Select Doctor</MenuItem>
                                            {doctorList.map((doctor) => (
                                                <MenuItem key={doctor._id} value={doctor._id}>
                                                    Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} — {doctor.department}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {!departmentSelected && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 0.5, display: 'block' }}
                                        >
                                            Please select a department first.
                                        </Typography>
                                    )}
                                </Grid2>

                                <Grid2 item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Date"
                                        type="date"
                                        value={formatDateForDateInput(date)}
                                        onChange={(e) => setDate(getformDate(e.target.value))}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ min: formatDateForDateInput(new Date()) }}
                                    />
                                </Grid2>
                            </Grid2>

                            <Divider sx={{ my: 3 }} />

                            {/* Available slots */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <EventAvailableIcon sx={{ color: GREEN, fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Available Time Slots
                                </Typography>
                                {availableSlots.length > 0 && !loading && (
                                    <Chip
                                        label={availableSlots.length}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(49,179,114,0.15)',
                                            color: GREEN_DARK,
                                            fontWeight: 700,
                                        }}
                                    />
                                )}
                            </Box>

                            {/* States: loading / empty / slots */}
                            {loading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                    <CircularProgress size={28} sx={{ color: GREEN }} />
                                </Box>
                            )}

                            {!loading && !doctorSelected && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Please select a doctor to view available time slots.
                                </Alert>
                            )}

                            {!loading && doctorSelected && availableSlots.length === 0 && (
                                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                    No available slots for the selected doctor and date. Try another date.
                                </Alert>
                            )}

                            {!loading && availableSlots.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {availableSlots.map((slot) => (
                                        <Chip
                                            key={slot}
                                            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                                            label={slot}
                                            onClick={() => slotClicked(slot)}
                                            sx={{
                                                bgcolor: 'rgba(49,179,114,0.08)',
                                                color: GREEN_DARK,
                                                border: `1.5px solid ${GREEN}`,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                px: 1,
                                                transition: 'all 0.15s ease',
                                                '&:hover': {
                                                    bgcolor: GREEN,
                                                    color: '#fff',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 16px rgba(49,179,114,0.3)',
                                                },
                                                '& .MuiChip-icon': { color: 'inherit' },
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>

            {/* ================= BOOKED APPOINTMENTS ================= */}
            {bookedAppointments.length > 0 ? (
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocalHospitalIcon sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                My Upcoming Appointments
                            </Typography>
                            <Chip
                                label={bookedAppointments.length}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(49,179,114,0.15)',
                                    color: GREEN_DARK,
                                    fontWeight: 700,
                                }}
                            />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <AppointmentTable
                            bookedAppointments={bookedAppointments}
                            deleteBookedSlots={deleteBookedSlots}
                            doctorList={doctorList}
                            patientList={patientList}
                            availableSlots={availableSlots}
                            getAvailableSlots={getAvailableSlots}
                            getBookedSlots={getBookedSlots}
                        />
                    </CardContent>
                </Card>
            ) : (
                !loading && (
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <EventBusyIcon sx={{ fontSize: 56, color: '#bbb', mb: 1 }} />
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                No upcoming appointments
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Book your first appointment using the form above.
                            </Typography>
                        </CardContent>
                    </Card>
                )
            )}

            {/* ================= BOOKING DIALOG ================= */}
            <BootstrapDialog onClose={handleClose} open={openDialogueBox} maxWidth="md" fullWidth>
                <BootstrapDialogTitle onClose={handleClose}>
                    Confirm Appointment Booking
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {bookingLoading ? (
                        <Box
                            sx={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', py: 4, gap: 2,
                            }}
                        >
                            <CircularProgress size={40} sx={{ color: GREEN }} />
                            <Typography variant="body2" color="text.secondary">
                                Booking your appointment...
                            </Typography>
                        </Box>
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

            {/* ================= ERROR DIALOG ================= */}
            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleErrorDialogueClose}
                ErrorTitle="Booking Error"
                ErrorList={errorList}
            />

            {/* ================= SUCCESS / ERROR SNACKBAR ================= */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snack.severity}
                    icon={snack.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    elevation={6}
                    sx={{ borderRadius: 2 }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PatientAppointment;