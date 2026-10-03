import * as React from 'react';

import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, Tooltip, CircularProgress, Alert,
    Snackbar, Box, Typography, IconButton, Chip, Stack, Divider, Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from "axios";

import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';
import { BootstrapDialog, BootstrapDialogTitle } from "../MUIDialogueBox/BoostrapDialogueBox";
import DialogContent from '@mui/material/DialogContent';
import AppointmentForm from '../Forms/AppointmentForm';

const GREEN = '#31b372';
const GREEN_DARK = '#28995f';
const RED = '#d32f2f';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function createData(patientName, doctorName, appointmentDate, appointmentTime, actionsID, appointmentData) {
    return { patientName, doctorName, appointmentDate, appointmentTime, actionsID, appointmentData };
}

const getInitials = (first, last) => {
    const a = (first || '').trim().charAt(0).toUpperCase();
    const b = (last || '').trim().charAt(0).toUpperCase();
    return `${a}${b}` || '?';
};

const formatDateForDisplay = (dateOfJoining) => {
    if (!dateOfJoining) return '—';
    const d = new Date(dateOfJoining);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function AppointmentTable({
    bookedAppointments,
    deleteBookedSlots,
    doctorList,
    patientList,
    availableSlots,
    getAvailableSlots,
    getBookedSlots,
}) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [loading, setLoading] = React.useState(false);
    const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = React.useState(false);
    const [openEditFormDialogue, setOpenEditFormDialogue] = React.useState(false);

    const [doctorId, setDoctorId] = React.useState('');
    const [patientId, setPatientId] = React.useState('');
    const [appointmentDate, setAppointmentDate] = React.useState('');
    const [appointmentTime, setAppointmentTime] = React.useState('');
    const [appointmentId, setAppointmentId] = React.useState('');
    const [appIDToDelete, setAppIDToDelete] = React.useState('');
    const [deleteContext, setDeleteContext] = React.useState('');

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    // ---------- Delete ----------
    const handleDeleteDialogueOpen = (appID, context = '') => {
        setAppIDToDelete(appID);
        setDeleteContext(context);
        setOpenConfirmDeleteDialogue(true);
    };

    const handleDeleteDialogueClose = () => {
        setOpenConfirmDeleteDialogue(false);
        setAppIDToDelete('');
        setDeleteContext('');
    };

    const handleDeleteAppointment = async () => {
        setLoading(true);
        try {
            await deleteBookedSlots(appIDToDelete);
            notify('success', 'Appointment deleted successfully.');
            handleDeleteDialogueClose();
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

    // ---------- Edit ----------
    const handleEditFormOpen = () => setOpenEditFormDialogue(true);

    const handleEditFormClose = () => {
        setOpenEditFormDialogue(false);
        setDoctorId('');
        setPatientId('');
        setAppointmentDate('');
        setAppointmentTime('');
        setAppointmentId('');
    };

    const formatDateForDateInput = (dateOfJoining) => {
        if (!dateOfJoining) return '';
        const d = new Date(dateOfJoining);
        if (Number.isNaN(d.getTime())) return '';
        return d.toISOString().slice(0, 10);
    };

    const setFormProperties = async (appID) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API}/appointments/${appID}`,
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const app = response.data.appointment;
            setDoctorId(app.doctorId?._id || app.doctorId);
            setPatientId(app.patientId?._id || app.patientId);
            setAppointmentDate(formatDateForDateInput(app.appointmentDate));
            setAppointmentTime(app.appointmentTime);
            setAppointmentId(app._id);
            handleEditFormOpen();
        } catch (error) {
            console.error('Error fetching appointment details:', error);
            notify('error', 'Failed to load appointment details.');
        } finally {
            setLoading(false);
        }
    };

    const updateAppointmentFormSubmitted = async (event, formData) => {
        event.preventDefault();

        let reqObj;
        if (formData) {
            reqObj = formData;
        } else {
            const form = document.forms.updateAppointment;
            reqObj = {
                appDate: form.appDate.value,
                appTime: form.appTime.value,
                doctorId: form.doctor.value,
                patientId: form.patient.value,
            };
        }

        setLoading(true);
        try {
            const response = await axios.put(
                `${API}/appointments/${appointmentId}`,
                reqObj,
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            if (response.data.message === 'success') {
                notify('success', 'Appointment updated successfully.');
                await getAvailableSlots();
                await getBookedSlots();
                handleEditFormClose();
            } else {
                notify('error', response.data.message || 'Failed to update appointment.');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            notify(
                'error',
                error.response?.data?.errors?.join(', ') ||
                error.response?.data?.message ||
                'Network error. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (_, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // ---------- Rows ----------
    const rows = React.useMemo(() => {
        if (!bookedAppointments || bookedAppointments.length === 0) return [];

        return bookedAppointments.map((apt) => {
            const patientName = apt.patientId?.userId
                ? `${apt.patientId.userId.firstName || ''} ${apt.patientId.userId.lastName || ''}`.trim()
                : 'Unknown Patient';

            const doctorName = apt.doctorId?.userId
                ? `Dr. ${apt.doctorId.userId.firstName || ''} ${apt.doctorId.userId.lastName || ''}`.trim()
                : 'Unknown Doctor';

            return createData(
                patientName,
                doctorName,
                formatDateForDisplay(apt.appointmentDate),
                apt.appointmentTime || '—',
                apt._id,
                apt
            );
        });
    }, [bookedAppointments]);

    // ---------- Empty ----------
    if (!bookedAppointments || bookedAppointments.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{ border: '1px solid #eee', borderRadius: 3, mt: 2 }}
            >
                <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                    <EventAvailableIcon sx={{ fontSize: 56, color: '#bbb', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        No appointments yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Book an appointment to get started.
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
                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <CalendarMonthIcon sx={{ color: GREEN }} />
                    <Typography variant="h6" fontWeight={700}>
                        Appointments
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
                                .map((row, index) => {
                                    const apt = row.appointmentData || {};
                                    const firstName = apt.patientId?.userId?.firstName || '';
                                    const lastName = apt.patientId?.userId?.lastName || '';
                                    

                                    return (
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
                                                        {getInitials(firstName, lastName)}
                                                    </Avatar>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                    >
                                                        {row.patientName}
                                                    </Typography>
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
                                                        {row.appointmentDate}
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
                                                    spacing={0.5}
                                                    justifyContent="center"
                                                >
                                                    <Tooltip title="Edit appointment" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setFormProperties(row.actionsID)}
                                                            sx={{
                                                                color: '#ff9800',
                                                                '&:hover': {
                                                                    bgcolor: 'rgba(255,152,0,0.1)',
                                                                },
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete appointment" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleDeleteDialogueOpen(
                                                                    row.actionsID,
                                                                    `${row.patientName} — ${row.appointmentDate}`
                                                                )
                                                            }
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
                                    );
                                })}
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

            {/* ---------- Delete confirmation ---------- */}
            <ConfirmDeleteDialogue
                title="Delete Appointment"
                message="This will cancel the appointment and free the time slot for other patients."
                itemName={deleteContext || 'Appointment'}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteAppointment}
                loading={loading}
                deleteButtonText="Delete Appointment"
            />

            {/* ---------- Edit dialog ---------- */}
            <BootstrapDialog
                onClose={handleEditFormClose}
                aria-labelledby="update-appointment-dialog-title"
                open={openEditFormDialogue}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle
                    id="update-appointment-dialog-title"
                    onClose={handleEditFormClose}
                >
                    Update Appointment
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {loading ? (
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
                                Loading appointment details...
                            </Typography>
                        </Box>
                    ) : (
                        <AppointmentForm
                            formName="updateAppointment"
                            formOnSubmit={updateAppointmentFormSubmitted}
                            appDate={appointmentDate}
                            appTime={appointmentTime}
                            doctorSelected={doctorId}
                            patientSelected={patientId}
                            doctorList={doctorList}
                            patientList={patientList}
                            availableSlots={availableSlots}
                            appointmentId={appointmentId}
                        />
                    )}
                </DialogContent>
            </BootstrapDialog>

            {/* ---------- Snackbar ---------- */}
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