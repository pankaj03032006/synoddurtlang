import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import axios from "axios";
import moment from "moment";
import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';
import { BootstrapDialog, BootstrapDialogTitle } from "../MUIDialogueBox/BoostrapDialogueBox";
import DialogContent from '@mui/material/DialogContent';
import AppointmentForm from '../Forms/AppointmentForm';

const columns = [
    { id: 'patientName', label: 'Patient Name', minWidth: 170 },
    { id: 'doctorName', label: 'Doctor Name', minWidth: 100 },
    { id: 'appointmentDate', label: 'Appointment Date', minWidth: 170 },
    { id: 'appointmentTime', label: 'Appointment Time', minWidth: 170 },
    { id: 'actionsID', label: 'Actions', minWidth: 100, align: 'center' },
];

function createData(patientName, doctorName, appointmentDate, appointmentTime, actionsID, appointmentData) {
    return { patientName, doctorName, appointmentDate, appointmentTime, actionsID, appointmentData };
}

export default function AppointmentTable({ 
    bookedAppointments, 
    deleteBookedSlots, 
    doctorList, 
    patientList, 
    availableSlots, 
    getAvailableSlots, 
    getBookedSlots 
}) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [loading, setLoading] = React.useState(false);
    const [successSnackbar, setSuccessSnackbar] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');
    const [errorSnackbar, setErrorSnackbar] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = React.useState(false);
    const [openEditFormDialogue, setOpenEditFormDialogue] = React.useState(false);

    const [doctorId, setDoctorId] = React.useState("");
    const [patientId, setPatientId] = React.useState("");
    const [appointmentDate, setAppointmentDate] = React.useState("");
    const [appointmentTime, setAppointmentTime] = React.useState("");
    const [appointmentId, setAppointmentId] = React.useState("");
    const [appIDToDelete, setAppIDToDelete] = React.useState("");

    const handleDeleteDialogueOpen = () => {
        setOpenConfirmDeleteDialogue(true);
    };

    const handleDeleteDialogueClose = () => {
        setOpenConfirmDeleteDialogue(false);
        setAppIDToDelete("");
    };

    const handleEditFormOpen = () => {
        setOpenEditFormDialogue(true);
    };

    const handleEditFormClose = () => {
        setOpenEditFormDialogue(false);
        // Reset form data
        setDoctorId("");
        setPatientId("");
        setAppointmentDate("");
        setAppointmentTime("");
        setAppointmentId("");
    };

    const updateAppointmentFormSubmitted = async (event, formData) => {
        event.preventDefault();
        
        // Use formData if provided, otherwise get from form
        let reqObj;
        if (formData) {
            reqObj = formData;
        } else {
            const form = document.forms.updateAppointment;
            reqObj = {
                appDate: form.appDate.value,
                appTime: form.appTime.value,
                doctorId: form.doctor.value,
                patientId: form.patient.value
            };
        }
        
        setLoading(true);
        
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/appointments/${appointmentId}`,
                reqObj,
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            
            if (response.data.message === "success") {
                setSuccessMessage("Appointment updated successfully!");
                setSuccessSnackbar(true);
                
                // Refresh appointments
                await getAvailableSlots();
                await getBookedSlots();
                
                handleEditFormClose();
            } else {
                setErrorMessage(response.data.message || "Failed to update appointment");
                setErrorSnackbar(true);
            }
        } catch (error) {
            console.error("Error updating appointment:", error);
            setErrorMessage(error.response?.data?.message || "Network error. Please try again.");
            setErrorSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppointment = async () => {
        setLoading(true);
        
        try {
            await deleteBookedSlots(appIDToDelete);
            setSuccessMessage("Appointment deleted successfully!");
            setSuccessSnackbar(true);
            handleDeleteDialogueClose();
        } catch (error) {
            console.error("Error deleting appointment:", error);
            setErrorMessage(error.response?.data?.message || "Failed to delete appointment");
            setErrorSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const formatDateForDateInput = (dateOfJoining) => {
        if (!dateOfJoining) return '';
        return moment(new Date(dateOfJoining)).format('YYYY-MM-DD');
    };

    const setFormProperties = async (appID) => {
        setLoading(true);
        
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/appointments/${appID}`,
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            
            const app = response.data.appointment;
            setDoctorId(app.doctorId?._id || app.doctorId);
            setPatientId(app.patientId?._id || app.patientId);
            setAppointmentDate(formatDateForDateInput(app.appointmentDate));
            setAppointmentTime(app.appointmentTime);
            setAppointmentId(app._id);
            
            handleEditFormOpen();
        } catch (error) {
            console.error("Error fetching appointment details:", error);
            setErrorMessage("Failed to load appointment details");
            setErrorSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Create rows from booked appointments
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
                formatDateForDateInput(apt.appointmentDate),
                apt.appointmentTime,
                apt._id,
                apt
            );
        });
    }, [bookedAppointments]);

    // Show empty state
    if (!bookedAppointments || bookedAppointments.length === 0) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 5, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No appointments found. Book an appointment to get started.
                </Alert>
            </Paper>
        );
    }

    return (
        <>
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 5, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
                                        style={{ 
                                            minWidth: column.minWidth, 
                                            fontWeight: "bold",
                                            backgroundColor: '#f5f5f5'
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow 
                                            hover 
                                            role="checkbox" 
                                            tabIndex={-1} 
                                            key={row.actionsID || index}
                                            sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                                        >
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                if (column.id === 'actionsID') {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'center'}>
                                                            <Tooltip title="Edit Appointment" placement="top" arrow>
                                                                <EditIcon
                                                                    className="mx-2"
                                                                    style={{ 
                                                                        color: '#ff6600', 
                                                                        fontSize: 28,
                                                                        cursor: 'pointer',
                                                                        transition: 'transform 0.2s'
                                                                    }}
                                                                    onClick={() => setFormProperties(value)}
                                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title="Delete Appointment" placement="top" arrow>
                                                                <DeleteIcon
                                                                    className="mx-2"
                                                                    style={{ 
                                                                        color: '#dc3545', 
                                                                        fontSize: 28,
                                                                        cursor: 'pointer',
                                                                        transition: 'transform 0.2s'
                                                                    }}
                                                                    onClick={() => {
                                                                        setAppIDToDelete(value);
                                                                        handleDeleteDialogueOpen();
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                />
                                                            </Tooltip>
                                                        </TableCell>
                                                    );
                                                } else {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'left'}>
                                                            {value || '-'}
                                                        </TableCell>
                                                    );
                                                }
                                            })}
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        "& p": {
                            "marginTop": 'auto',
                            "marginBottom": 'auto'
                        }
                    }}
                />
            </Paper>

            {/* Delete Confirmation Dialogue */}
            <ConfirmDeleteDialogue
                title="Delete Appointment"
                message="Are you sure you want to delete this appointment?"
                itemName={`Appointment on ${appointmentDate}`}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteAppointment}
                loading={loading}
                deleteButtonText="Delete Appointment"
            />

            {/* Edit Appointment Dialogue */}
            <BootstrapDialog
                onClose={handleEditFormClose}
                aria-labelledby="customized-dialog-title"
                open={openEditFormDialogue}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handleEditFormClose}>
                    Update Appointment
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <CircularProgress />
                            <p>Loading appointment details...</p>
                        </div>
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

            {/* Success Snackbar */}
            <Snackbar
                open={successSnackbar}
                autoHideDuration={3000}
                onClose={() => setSuccessSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSuccessSnackbar(false)} elevation={6}>
                    {successMessage}
                </Alert>
            </Snackbar>

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
        </>
    );
}