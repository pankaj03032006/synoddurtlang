import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import axios from "axios";
import moment from "moment";
import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';
import { BootstrapDialog, BootstrapDialogTitle } from "../MUIDialogueBox/BoostrapDialogueBox";
import DialogContent from '@mui/material/DialogContent';
import PrescriptionForm from '../Forms/PrescriptionForm';
import { NavLink } from 'react-router-dom';

const columns = [
    { id: 'patientName', label: 'Patient Name', minWidth: 170 },
    { id: 'doctorName', label: 'Doctor Name', minWidth: 100 },
    { id: 'appointmentDate', label: 'Appointment Date', minWidth: 170 },
    { id: 'appointmentTime', label: 'Appointment Time', minWidth: 170 },
    { id: 'actionsID', label: 'Actions', minWidth: 100, align: 'center' },
    { id: 'patientID', label: 'patientID', minWidth: 100, hidden: true },
    { id: 'patientFirstName', label: 'patientFirstName', minWidth: 100, hidden: true },
    { id: 'patientLastName', label: 'patientLastName', minWidth: 100, hidden: true }
];

function createData(patientName, doctorName, appointmentDate, appointmentTime, actionsID, patientID, patientFirstName, patientLastName) {
    return { patientName, doctorName, appointmentDate, appointmentTime, actionsID, patientID, patientFirstName, patientLastName };
}

export default function DoctorAppointmentTable({ 
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
    const [openPrescriptionFormDialogue, setOpenPrescriptionFormDialogue] = React.useState(false);

    const [doctorId, setDoctorId] = React.useState("");
    const [patientId, setPatientId] = React.useState("");
    const [patientFirstName, setPatientFirstName] = React.useState("");
    const [patientLastName, setPatientLastName] = React.useState("");
    const [appointmentDate, setAppointmentDate] = React.useState("");
    const [appointmentTime, setAppointmentTime] = React.useState("");
    const [appointmentId, setAppointmentId] = React.useState("");
    const [appIDToDelete, setAppIDToDelete] = React.useState("");
    const [prescriptionLoading, setPrescriptionLoading] = React.useState(false);

    const handleDeleteDialogueOpen = (appID) => {
        setAppIDToDelete(appID);
        setOpenConfirmDeleteDialogue(true);
    };

    const handleDeleteDialogueClose = () => {
        setOpenConfirmDeleteDialogue(false);
        setAppIDToDelete("");
    };

    const handlePrescriptionFormClose = () => {
        setOpenPrescriptionFormDialogue(false);
        // Reset form data
        setDoctorId("");
        setPatientId("");
        setPatientFirstName("");
        setPatientLastName("");
        setAppointmentDate("");
        setAppointmentTime("");
        setAppointmentId("");
    };

    const handleDeleteAppointment = async () => {
        setLoading(true);
        
        try {
            await deleteBookedSlots(appIDToDelete);
            setSuccessMessage("Appointment deleted successfully!");
            setSuccessSnackbar(true);
            handleDeleteDialogueClose();
            if (getBookedSlots) await getBookedSlots();
        } catch (error) {
            console.error("Error deleting appointment:", error);
            setErrorMessage(error.response?.data?.message || "Failed to delete appointment");
            setErrorSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const prescriptionFormSubmitted = async (event, formData) => {
        event.preventDefault();
        
        setPrescriptionLoading(true);
        
        try {
            const reqObj = {
                appointmentId: appointmentId,
                remarks: formData?.remarks || '',
                medicines: formData?.medicines || []
            };
            
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/prescriptions`,
                reqObj,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            
            if (response.data.message === "success") {
                setSuccessMessage("Prescription saved successfully!");
                setSuccessSnackbar(true);
                if (getBookedSlots) await getBookedSlots();
                handlePrescriptionFormClose();
            } else {
                setErrorMessage(response.data.message || "Failed to save prescription");
                setErrorSnackbar(true);
            }
        } catch (error) {
            console.error("Error saving prescription:", error);
            setErrorMessage(error.response?.data?.message || "Network error. Please try again.");
            setErrorSnackbar(true);
        } finally {
            setPrescriptionLoading(false);
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
        const dateStr = dateOfJoining.slice(0, -1);
        return moment(new Date(dateStr)).format('YYYY-MM-DD');
    };

    const setFormProperties = (appID, rowData) => {
        // Set data directly from the row without API call
        setPatientId(rowData.patientID);
        setPatientFirstName(rowData.patientFirstName || '');
        setPatientLastName(rowData.patientLastName || '');
        setAppointmentDate(rowData.appointmentDate);
        setAppointmentTime(rowData.appointmentTime);
        setAppointmentId(appID);
        setDoctorId(doctorList[0]?._id || "");
        
        // Open the dialog immediately
        setOpenPrescriptionFormDialogue(true);
    };

    // Create rows from booked appointments
    const rows = React.useMemo(() => {
        if (!bookedAppointments || bookedAppointments.length === 0) return [];
        
        return bookedAppointments.map((apt) => {
            const firstName = apt.patientId?.userId?.firstName || apt.patientId?.firstName || '';
            const lastName = apt.patientId?.userId?.lastName || apt.patientId?.lastName || '';
            const patientNameDisplay = firstName && lastName ? `${firstName} ${lastName}` : 'Unknown Patient';
            
            const doctorNameDisplay = apt.doctorId?.userId 
                ? `Dr. ${apt.doctorId.userId.firstName || ''} ${apt.doctorId.userId.lastName || ''}`.trim()
                : 'Unknown Doctor';
            
            return createData(
                patientNameDisplay,
                doctorNameDisplay,
                formatDateForDateInput(apt.appointmentDate),
                apt.appointmentTime,
                apt._id,
                apt.patientId?._id || '',
                firstName,
                lastName
            );
        });
    }, [bookedAppointments]);

    const visibleColumns = React.useMemo(() => {
        return columns.filter(column => !column.hidden);
    }, []);

    // Get full patient name for dialog title
    const getFullPatientName = () => {
        if (patientFirstName || patientLastName) {
            return `${patientFirstName} ${patientLastName}`.trim();
        }
        return 'Patient';
    };

    if (!bookedAppointments || bookedAppointments.length === 0) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 5, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No appointments found. Please check back later.
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
                                {visibleColumns.map((column) => (
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
                                            {visibleColumns.map((column) => {
                                                const value = row[column.id];
                                                
                                                if (column.id === 'actionsID') {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'center'}>
                                                            <div className="d-flex gap-2" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                                <Tooltip title="Create Prescription" placement="top" arrow>
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={() => setFormProperties(value, row)}
                                                                        disabled={loading}
                                                                        style={{ minWidth: '100px' }}
                                                                    >
                                                                        <i className="fa fa-prescription-bottle me-1"></i>
                                                                        Write Prescription
                                                                    </button>
                                                                </Tooltip>
                                                                <Tooltip title="Delete Appointment" placement="top" arrow>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => handleDeleteDialogueOpen(value)}
                                                                        disabled={loading}
                                                                    >
                                                                        <i className="fa fa-trash me-1"></i>
                                                                        Delete
                                                                    </button>
                                                                </Tooltip>
                                                            </div>
                                                        </TableCell>
                                                    );
                                                } 
                                                
                                                if (column.id === 'patientName') {
                                                    const patientID = row.patientID;
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'left'}>
                                                            {patientID ? (
                                                                <NavLink 
                                                                    to={`/doctor/dashboard/patient/history/${patientID}`} 
                                                                    className="text-decoration-none"
                                                                    style={{ color: '#1976d2', textDecoration: 'none' }}
                                                                >
                                                                    {value || '-'}
                                                                </NavLink>
                                                            ) : (
                                                                value || '-'
                                                            )}
                                                        </TableCell>
                                                    );
                                                }
                                                
                                                return (
                                                    <TableCell key={column.id} align={column.align || 'left'}>
                                                        {value || '-'}
                                                    </TableCell>
                                                );
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
                />
            </Paper>

            <ConfirmDeleteDialogue
                title="Delete Appointment"
                message="Are you sure you want to delete this appointment?"
                itemName="Appointment"
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteAppointment}
                loading={loading}
                deleteButtonText="Delete Appointment"
            />

            <BootstrapDialog
                onClose={handlePrescriptionFormClose}
                aria-labelledby="customized-dialog-title"
                open={openPrescriptionFormDialogue}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handlePrescriptionFormClose}>
                    Create Prescription for {getFullPatientName()}
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {prescriptionLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <CircularProgress />
                            <p style={{ marginTop: '10px' }}>Saving prescription...</p>
                        </div>
                    ) : (
                        <PrescriptionForm
                            formName="prescriptionForm"
                            formOnSubmit={prescriptionFormSubmitted}
                            appDate={appointmentDate}
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