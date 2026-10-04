import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, Button, TextField, MenuItem,
    FormControl, InputLabel, Select, Alert,
    Snackbar, CircularProgress, Divider, Chip, Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from "axios";

import styles from './Appointment.module.css';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import MyCalendar from '../Datepicker/MyCalendar';
import { BootstrapDialog, BootstrapDialogTitle } from '../MUIDialogueBox/BoostrapDialogueBox';
import DialogContent from '@mui/material/DialogContent';
import AppointmentForm from '../Forms/AppointmentForm';
import AppointmentTable from '../MUITable/AppointmentTable';
import useAppointments from '../../hooks/useAppointments';

const API = process.env.REACT_APP_API_URL || 'https://synoddurtlang.onrender.com';
const GREEN = '#31b372';
const GREEN_DARK = '#28995f';

const TIME_SLOTS = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
];

function AdminAppointment() {
    const [clickedTimeSlot, setClickedTimeSlot] = useState('');
    const [openDialogueBox, setOpenDialogueBox] = useState(false);
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [creatingSlots, setCreatingSlots] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const {
        date, setDate, availableSlots, bookedAppointments,
        departmentList, doctorList, patientList,
        departmentSelected, setDepartmentSelected,
        doctorSelected, setDoctorSelected,
        getAvailableSlots, getBookedSlots, deleteBookedSlots,
        formatDateForDateInput, getformDate, loading,
    } = useAppointments('admin');

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    const handleErrorDialogueOpen = () => setErrorDialogueBoxOpen(true);
    const handleErrorDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    };

    const handleClickOpen = () => setOpenDialogueBox(true);
    const handleClose = () => setOpenDialogueBox(false);

    const handleDepartmentChange = (event) => {
        setDepartmentSelected(event.target.value);
        setDoctorSelected("");
    };

    const handleDoctorChange = (event) => {
        setDoctorSelected(event.target.value);
    };

    // ---------- BOOK APPOINTMENT ----------
    const addAppointmentFormSubmitted = async (event) => {
        event.preventDefault();
        const form = document.forms.addAppointment;

        if (!form) return;

        const reqObj = {
            appDate: form.appDate.value,
            appTime: form.appTime.value,
            doctorId: form.doctor.value,
            patientId: form.patient.value,
        };

        setBookingLoading(true);
        try {
            const response = await axios.put(`${API}/appointments/`, reqObj, {
                headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (response.data.message === "success") {
                await Promise.all([getAvailableSlots(), getBookedSlots()]);
                handleClose();
                notify('success', 'Appointment booked successfully.');
            }
        } catch (error) {
            console.error("Error creating appointment:", error);
            setErrorList([error.response?.data?.message || "Failed to create appointment"]);
            handleErrorDialogueOpen();
            // Dialog stays open so the user can retry
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

    // ---------- CREATE SLOTS ----------
    const toggleSlot = (slot) => {
        setSelectedSlots((prev) =>
            prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
        );
    };

    const handleCreateSlotSubmit = async (event) => {
        event.preventDefault();
        const form = document.forms.createSlotForm;

        if (selectedSlots.length === 0) {
            notify('error', 'Please choose at least one time slot.');
            return;
        }
        if (!form.doctor.value) {
            notify('error', 'Please select a doctor.');
            return;
        }

        setCreatingSlots(true);
        try {
            const response = await axios.post(
                `${API}/appointments/add`,
                {
                    appDate: getformDate(form.appDate.value),
                    timeSlots: selectedSlots,
                    doctorID: form.doctor.value,
                },
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            if (response.data.message === "success") {
                await Promise.all([getAvailableSlots(), getBookedSlots()]);
                setSelectedSlots([]);
                notify('success', `${selectedSlots.length} slot(s) created successfully.`);
            }
        } catch (error) {
            setErrorList(error.response?.data?.errors || ["An error occurred"]);
            handleErrorDialogueOpen();
        } finally {
            setCreatingSlots(false);
        }
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
                        <CalendarMonthIcon sx={{ color: GREEN }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Appointments Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create slots, view the schedule, and book appointments for patients.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ================= CALENDAR + SLOT FORM ================= */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={5} lg={4}>
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
                </Grid>

                <Grid item xs={12} md={7} lg={8}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AddCircleIcon sx={{ color: GREEN }} />
                                <Typography variant="h6" fontWeight={700}>
                                    Create New Slots
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Pick a doctor and choose available time slots.
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <form name="createSlotForm" id="createSlotForm" onSubmit={handleCreateSlotSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Department</InputLabel>
                                            <Select
                                                name="department"
                                                label="Department"
                                                value={departmentSelected}
                                                onChange={handleDepartmentChange}
                                            >
                                                <MenuItem value="">All Departments</MenuItem>
                                                {departmentList.map((sp) => (
                                                    <MenuItem key={sp} value={sp}>{sp}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth size="small" required>
                                            <InputLabel>Doctor</InputLabel>
                                            <Select
                                                name="doctor"
                                                label="Doctor"
                                                value={doctorSelected}
                                                onChange={handleDoctorChange}
                                            >
                                                <MenuItem value="">Choose Doctor</MenuItem>
                                                {doctorList.map((doctor) => (
                                                    <MenuItem key={doctor._id} value={doctor._id}>
                                                        Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} — {doctor.department}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Date"
                                            name="appDate"
                                            type="date"
                                            value={formatDateForDateInput(date)}
                                            onChange={(e) => setDate(getformDate(e.target.value))}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* ---- Time slots ---- */}
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <AccessTimeIcon sx={{ color: GREEN, fontSize: 20 }} />
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            Available Time Slots
                                        </Typography>
                                        {selectedSlots.length > 0 && (
                                            <Chip
                                                label={`${selectedSlots.length} selected`}
                                                size="small"
                                                sx={{ bgcolor: 'rgba(49,179,114,0.15)', color: GREEN_DARK, fontWeight: 700 }}
                                            />
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {TIME_SLOTS.map((slot) => {
                                            const taken = availableSlots.includes(slot);
                                            const selected = selectedSlots.includes(slot);

                                            if (taken) return null;

                                            return (
                                                <Chip
                                                    key={slot}
                                                    label={slot}
                                                    onClick={() => toggleSlot(slot)}
                                                    variant={selected ? 'filled' : 'outlined'}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        bgcolor: selected ? GREEN : 'transparent',
                                                        color: selected ? '#fff' : 'inherit',
                                                        borderColor: GREEN,
                                                        '&:hover': {
                                                            bgcolor: selected ? GREEN_DARK : 'rgba(49,179,114,0.08)',
                                                        },
                                                    }}
                                                />
                                            );
                                        })}
                                        {TIME_SLOTS.every((s) => availableSlots.includes(s)) && (
                                            <Typography variant="body2" color="text.secondary">
                                                All slots are already booked for this date.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={creatingSlots}
                                        startIcon={
                                            creatingSlots
                                                ? <CircularProgress size={16} color="inherit" />
                                                : <AddCircleIcon />
                                        }
                                        sx={{
                                            backgroundColor: GREEN,
                                            '&:hover': { backgroundColor: GREEN_DARK },
                                            textTransform: 'none',
                                            px: 3,
                                        }}
                                    >
                                        {creatingSlots ? 'Creating...' : 'Create Slots'}
                                    </Button>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ================= AVAILABLE SLOTS ================= */}
            {availableSlots.length > 0 && (
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', mb: 3 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EventAvailableIcon sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                Available Slots
                            </Typography>
                            <Chip
                                label={availableSlots.length}
                                size="small"
                                sx={{ bgcolor: 'rgba(49,179,114,0.15)', color: GREEN_DARK, fontWeight: 700 }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Click on a slot to book an appointment for a patient.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {availableSlots.map((slot) => (
                                <Tooltip key={slot} title="Book this slot" arrow>
                                    <Box
                                        onClick={() => slotClicked(slot)}
                                        sx={{
                                            px: 2, py: 1.2,
                                            borderRadius: 2,
                                            border: `1.5px solid ${GREEN}`,
                                            bgcolor: 'rgba(49,179,114,0.06)',
                                            color: GREEN_DARK,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            userSelect: 'none',
                                            '&:hover': {
                                                bgcolor: GREEN,
                                                color: '#fff',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 16px rgba(49,179,114,0.3)',
                                            },
                                        }}
                                    >
                                        {slot}
                                    </Box>
                                </Tooltip>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} />
                </Box>
            )}

            {/* ================= BOOKED APPOINTMENTS ================= */}
            {bookedAppointments.length > 0 && (
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocalHospitalIcon sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                Booked Appointments
                            </Typography>
                            <Chip
                                label={bookedAppointments.length}
                                size="small"
                                sx={{ bgcolor: 'rgba(49,179,114,0.15)', color: GREEN_DARK, fontWeight: 700 }}
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
            )}

            {/* ================= ERROR DIALOG ================= */}
            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleErrorDialogueClose}
                ErrorTitle="Error"
                ErrorList={errorList}
            />

            {/* ================= BOOK APPOINTMENT DIALOG ================= */}
            <BootstrapDialog onClose={handleClose} open={openDialogueBox} maxWidth="md" fullWidth>
                <BootstrapDialogTitle onClose={handleClose}>
                    Book Appointment — {clickedTimeSlot}
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {bookingLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
                            <CircularProgress size={40} sx={{ color: GREEN }} />
                            <Typography variant="body2" color="text.secondary">
                                Booking appointment...
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

            {/* ================= SNACKBAR ================= */}
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

export default AdminAppointment;