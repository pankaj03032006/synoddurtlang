import * as React from 'react';
import { NavLink,useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, Tooltip, CircularProgress, Alert,
    Snackbar, Box, Typography, IconButton, Chip, Button,Stack,
    Divider, Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from "axios";

import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';
import { BootstrapDialog, BootstrapDialogTitle } from "../MUIDialogueBox/BoostrapDialogueBox";
import DialogContent from '@mui/material/DialogContent';
import PrescriptionForm from '../Forms/PrescriptionForm';

const GREEN = '#31b372';
const GREEN_DARK = '#28995f';
const RED = '#d32f2f';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ---- Row data ----
function createData({
    patientName,
    patientFirstName,
    patientLastName,
    doctorName,
    appointmentDate,
    appointmentTime,
    actionsID,
    patientID,
}) {
    return {
        patientName,
        patientFirstName,
        patientLastName,
        doctorName,
        appointmentDate,
        appointmentTime,
        actionsID,
        patientID,
    };
}

const getInitials = (first, last) => {
    const a = (first || '').trim().charAt(0).toUpperCase();
    const b = (last || '').trim().charAt(0).toUpperCase();
    return `${a}${b}` || '?';
};

export default function DoctorAppointmentTable({
    bookedAppointments,
    deleteBookedSlots,
    doctorList,
    patientList,
    availableSlots,
    getAvailableSlots,
    getBookedSlots,
}) {
    const navigate = useNavigate();

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [loading, setLoading] = React.useState(false);
    const [prescriptionLoading, setPrescriptionLoading] = React.useState(false);
    const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = React.useState(false);
    const [openPrescriptionFormDialogue, setOpenPrescriptionFormDialogue] = React.useState(false);

    const [doctorId, setDoctorId] = React.useState('');
    const [patientId, setPatientId] = React.useState('');
    const [patientFirstName, setPatientFirstName] = React.useState('');
    const [patientLastName, setPatientLastName] = React.useState('');
    const [appointmentDate, setAppointmentDate] = React.useState('');
    const [appointmentTime, setAppointmentTime] = React.useState('');
    const [appointmentId, setAppointmentId] = React.useState('');
    const [appIDToDelete, setAppIDToDelete] = React.useState('');

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    // ---------- Delete ----------
    const handleDeleteDialogueOpen = (appID) => {
        setAppIDToDelete(appID);
        setOpenConfirmDeleteDialogue(true);
    };

    const handleDeleteDialogueClose = () => {
        setOpenConfirmDeleteDialogue(false);
        setAppIDToDelete('');
    };

    const handleDeleteAppointment = async () => {
        setLoading(true);
        try {
            await deleteBookedSlots(appIDToDelete);
            notify('success', 'Appointment deleted successfully.');
            handleDeleteDialogueClose();
            if (getBookedSlots) await getBookedSlots();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            notify(
                'error',
                error.response?.data?.message || 'Failed to delete appointment.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ---------- Prescription ----------
    const handlePrescriptionFormClose = () => {
        setOpenPrescriptionFormDialogue(false);
        setDoctorId('');
        setPatientId('');
        setPatientFirstName('');
        setPatientLastName('');
        setAppointmentDate('');
        setAppointmentTime('');
        setAppointmentId('');
    };

    const prescriptionFormSubmitted = async (event, formData) => {
        event.preventDefault();
        setPrescriptionLoading(true);
        try {
            // PrescriptionForm already builds the correct body:
            // { appointmentId, remarks, prescribedMed: [...] }
            const response = await axios.post(
                `${API}/prescription`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data.message === 'success') {
                notify('success', 'Prescription saved successfully.');
                if (getBookedSlots) await getBookedSlots();
                handlePrescriptionFormClose();
            } else {
                notify(
                    'error',
                    response.data.errors?.join(', ') ||
                    response.data.message ||
                    'Failed to save prescription.'
                );
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            notify(
                'error',
                error.response?.data?.errors?.join(', ') ||
                error.response?.data?.message ||
                'Network error. Please try again.'
            );
        } finally {
            setPrescriptionLoading(false);
        }
    };

    const handleChangePage = (_, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const formatDateForDateInput = (dateOfJoining) => {
        if (!dateOfJoining) return '';
        const dateStr = dateOfJoining.slice(0, -1);
        return new Date(dateStr).toISOString().slice(0, 10);
    };

    const formatDateForDisplay = (dateOfJoining) => {
        if (!dateOfJoining) return '—';
        const dateStr = dateOfJoining.slice(0, -1);
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const setFormProperties = (appID, rowData) => {
        setPatientId(rowData.patientID);
        setPatientFirstName(rowData.patientFirstName || '');
        setPatientLastName(rowData.patientLastName || '');
        setAppointmentDate(rowData.appointmentDate);
        setAppointmentTime(rowData.appointmentTime);
        setAppointmentId(appID);
        setDoctorId(doctorList?.[0]?._id || '');
        setOpenPrescriptionFormDialogue(true);
    };

    // ---------- Rows ----------
    const rows = React.useMemo(() => {
        if (!bookedAppointments || bookedAppointments.length === 0) return [];

        return bookedAppointments.map((apt) => {
            const firstName = apt.patientId?.userId?.firstName || apt.patientId?.firstName || '';
            const lastName = apt.patientId?.userId?.lastName || apt.patientId?.lastName || '';
            const patientNameDisplay =
                firstName && lastName
                    ? `${firstName} ${lastName}`
                    : 'Unknown Patient';

            const doctorNameDisplay = apt.doctorId?.userId
                ? `Dr. ${apt.doctorId.userId.firstName || ''} ${apt.doctorId.userId.lastName || ''}`.trim()
                : 'Unknown Doctor';

            return createData({
                patientName: patientNameDisplay,
                patientFirstName: firstName,
                patientLastName: lastName,
                doctorName: doctorNameDisplay,
                appointmentDate: apt.appointmentDate,
                appointmentTime: apt.appointmentTime || '—',
                actionsID: apt._id,
                patientID: apt.patientId?._id || '',
            });
        });
    }, [bookedAppointments]);

    const getFullPatientName = () => {
        const n = `${patientFirstName} ${patientLastName}`.trim();
        return n || 'Patient';
    };

    // ---------- Loading / Empty ----------
    if (!bookedAppointments || bookedAppointments.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{ border: '1px solid #eee', borderRadius: 3, mt: 2 }}
            >
                <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                    <EventAvailableIcon sx={{ fontSize: 56, color: '#bbb', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        No appointments scheduled
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Booked appointments will appear here once patients schedule with you.
                    </Typography>
                </Box>
            </Paper>
        );
    }

    // ---------- UI ----------
    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    border: '1px solid #eee',
                    borderRadius: 3,
                    overflow: 'hidden',
                    mt: 2,
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <LocalHospitalIcon sx={{ color: GREEN }} />
                    <Typography variant="h6" fontWeight={700}>
                        Booked Appointments
                    </Typography>
                    <Chip
                        label={rows.length}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(49,179,114,0.15)',
                            color: GREEN_DARK,
                            fontWeight: 700,
                        }}
                    />
                </Box>

                <Divider />

                <TableContainer sx={{ maxHeight: 560 }}>
                    <Table stickyHeader aria-label="appointments table">
                        <TableHead>
                            <TableRow>
                                {[
                                    { id: 'patientName', label: 'Patient' },
                                    { id: 'doctorName', label: 'Doctor' },
                                    { id: 'appointmentDate', label: 'Date' },
                                    { id: 'appointmentTime', label: 'Time' },
                                    { id: 'actionsID', label: 'Actions', align: 'center' },
                                ].map((col) => (
                                    <TableCell
                                        key={col.id}
                                        align={col.align || 'left'}
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: '#fafafa',
                                            color: '#555',
                                            textTransform: 'uppercase',
                                            fontSize: 12,
                                            letterSpacing: 0.5,
                                            borderBottom: '2px solid #eee',
                                            minWidth: 140,
                                        }}
                                    >
                                        {col.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => (
                                    <TableRow
                                        hover
                                        key={row.actionsID || index}
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(49,179,114,0.04)' },
                                            '&:last-child td': { borderBottom: 'none' },
                                        }}
                                    >
                                        {/* Patient */}
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        bgcolor: 'rgba(49,179,114,0.15)',
                                                        color: GREEN_DARK,
                                                        fontSize: 14,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {getInitials(
                                                        row.patientFirstName,
                                                        row.patientLastName
                                                    )}
                                                </Avatar>
                                                {row.patientID ? (
                                                    <NavLink
                                                        to={`/doctor/dashboard/patient/history/${row.patientID}`}
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: GREEN_DARK,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {row.patientName}
                                                    </NavLink>
                                                ) : (
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {row.patientName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>

                                        {/* Doctor */}
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.doctorName}
                                            </Typography>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell>
                                            <Stack direction="row" spacing={0.75} alignItems="center">
                                                <CalendarMonthIcon
                                                    sx={{ fontSize: 16, color: '#999' }}
                                                />
                                                <Typography variant="body2">
                                                    {formatDateForDisplay(row.appointmentDate)}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        {/* Time */}
                                        <TableCell>
                                            <Chip
                                                icon={
                                                    <AccessTimeIcon
                                                        sx={{ fontSize: 14, color: `${GREEN_DARK} !important` }}
                                                    />
                                                }
                                                label={row.appointmentTime}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(49,179,114,0.1)',
                                                    color: GREEN_DARK,
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                }}
                                            />
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="center">
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<AssignmentIcon />}
                                                    onClick={() =>
                                                        setFormProperties(row.actionsID, row)
                                                    }
                                                    disabled={loading}
                                                    sx={{
                                                        bgcolor: GREEN,
                                                        color: '#fff',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: 12,
                                                        px: 2,
                                                        '&:hover': { bgcolor: GREEN_DARK },
                                                    }}
                                                >
                                                    Write Prescription
                                                </Button>
                                                <Tooltip title="Delete appointment" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleDeleteDialogueOpen(row.actionsID)
                                                        }
                                                        disabled={loading}
                                                        sx={{
                                                            color: RED,
                                                            '&:hover': {
                                                                bgcolor: 'rgba(211,47,47,0.08)',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider />

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        '& p': { marginTop: 'auto', marginBottom: 'auto' },
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            marginTop: 'auto',
                            marginBottom: 'auto',
                        },
                    }}
                />
            </Paper>

            {/* Delete confirmation */}
            <ConfirmDeleteDialogue
                title="Delete Appointment"
                message="This will cancel the appointment and free the time slot."
                itemName="Appointment"
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteAppointment}
                loading={loading}
                deleteButtonText="Delete Appointment"
            />

            {/* Prescription dialog */}
            <BootstrapDialog
                onClose={handlePrescriptionFormClose}
                aria-labelledby="prescription-dialog-title"
                open={openPrescriptionFormDialogue}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle
                    id="prescription-dialog-title"
                    onClose={handlePrescriptionFormClose}
                >
                    Create Prescription for {getFullPatientName()}
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {prescriptionLoading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                py: 4,
                                gap: 2,
                            }}
                        >
                            <CircularProgress size={40} sx={{ color: GREEN }} />
                            <Typography variant="body2" color="text.secondary">
                                Saving prescription...
                            </Typography>
                        </Box>
                    ) : (
                        <PrescriptionForm
                            formName="prescriptionForm"
                            formOnSubmit={prescriptionFormSubmitted}
                            appDate={formatDateForDateInput(appointmentDate)}
                            appTime={appointmentTime}
                            doctorSelected={doctorId}
                            patientSelected={patientId}
                            patientName={getFullPatientName()}
                            patientFirstName={patientFirstName}
                            patientLastName={patientLastName}
                            doctorList={doctorList}
                            patientList={patientList}
                            availableSlots={availableSlots}
                            appointmentId={appointmentId}
                        />
                    )}
                </DialogContent>
            </BootstrapDialog>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={snack.severity === 'error' ? 6000 : 3000}
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
        </>
    );
}