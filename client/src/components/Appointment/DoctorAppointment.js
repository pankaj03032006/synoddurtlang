import React, { useContext } from "react";
import { NavLink } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Divider, Chip, Grid,
    Alert, CircularProgress,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventBusyIcon from "@mui/icons-material/EventBusy";

import styles from "./Appointment.module.css";
import MyCalendar from "../Datepicker/MyCalendar";
import DoctorAppointmentTable from "../MUITable/DoctorAppointmentTable";
import { UserContext } from "../../Context/UserContext";
import useAppointments from "../../hooks/useAppointments";

const GREEN = "#31b372";
const GREEN_DARK = "#28995f";

function DoctorAppointment() {
    const { currentUser } = useContext(UserContext);
    const doctorId = currentUser?.doctorId || currentUser?._id;

    const {
        date,
        setDate,
        availableSlots,
        bookedAppointments,
        patientList,
        doctorList,
        deleteBookedSlots,
        getAvailableSlots,
        getBookedSlots,
        formatDateForDateInput,
        getformDate,
        loading,
    } = useAppointments("doctor", doctorId);

    const renderSlots = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} sx={{ color: GREEN }} />
                </Box>
            );
        }

        if (availableSlots.length === 0) {
            return (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No available slots for the selected date. Please check another date.
                </Alert>
            );
        }

        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableSlots.map((slot) => (
                    <Chip
                        key={slot}
                        icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                        label={slot}
                        sx={{
                            bgcolor: 'rgba(49,179,114,0.08)',
                            color: GREEN_DARK,
                            border: `1px solid ${GREEN}`,
                            fontWeight: 600,
                            px: 1,
                        }}
                    />
                ))}
            </Box>
        );
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
                            My Appointments Schedule
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            View your booked appointments and available slots.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ================= WELCOME + CALENDAR ================= */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Calendar */}
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

                {/* Welcome + slots */}
                <Grid item xs={12} md={7} lg={8}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: '1px solid #eee',
                            overflow: 'hidden',
                        }}
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
                                Welcome, Dr. {currentUser?.firstName} {currentUser?.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Here's your schedule for the selected date.
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            {/* Date picker */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                    sx={{ display: 'block', mb: 0.5 }}
                                >
                                    Selected Date
                                </Typography>
                                <input
                                    id="appDate"
                                    name="appDate"
                                    type="date"
                                    value={formatDateForDateInput(date)}
                                    onChange={(e) => setDate(getformDate(e.target.value))}
                                    style={{
                                        width: '100%',
                                        maxWidth: 300,
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        outline: 'none',
                                        color: '#333',
                                    }}
                                />
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* Available slots */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <EventAvailableIcon sx={{ color: GREEN, fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Available Slots
                                </Typography>
                                {availableSlots.length > 0 && (
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
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Slots for {formatDateForDateInput(date)}
                            </Typography>
                            {renderSlots()}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ================= BOOKED APPOINTMENTS ================= */}
            {bookedAppointments.length > 0 ? (
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocalHospitalIcon sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                My Scheduled Appointments
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Click "Write Prescription" on a row to create a prescription for that patient.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <DoctorAppointmentTable
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
                                No appointments scheduled for this date
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Select a different date to view your schedule.
                            </Typography>
                        </CardContent>
                    </Card>
                )
            )}
        </Box>
    );
}

export default DoctorAppointment;