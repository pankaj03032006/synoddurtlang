import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '../../Context/UserContext';
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
import Button from '@mui/material/Button';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DownloadIcon from '@mui/icons-material/Download';
import axios from "axios";
import moment from "moment";

function createData(patientName, doctorName, appointmentDate, appointmentTime, prescribedMed, remarks, actionsID, paid) {
    return { patientName, doctorName, appointmentDate, appointmentTime, prescribedMed, remarks, actionsID, paid };
}

export default function PrescriptionTable({ prescriptionList, loading: propLoading }) {
    const { currentUser } = useContext(UserContext);
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [successSnackbar, setSuccessSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorSnackbar, setErrorSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Define columns based on user type
    const columns = useMemo(() => {
        if (currentUser?.userType === "Patient") {
            return [
                { id: 'patientName', label: 'Patient Name', minWidth: 170 },
                { id: 'doctorName', label: 'Doctor Name', minWidth: 150 },
                { id: 'appointmentDate', label: 'Appointment Date', minWidth: 130 },
                { id: 'appointmentTime', label: 'Appointment Time', minWidth: 130 },
                { id: 'prescribedMed', label: 'Prescription', minWidth: 250 },
                { id: 'remarks', label: 'Remarks', minWidth: 200 },
                { id: 'actionsID', label: 'Actions', minWidth: 150, align: 'center' },
            ];
        } else {
            return [
                { id: 'patientName', label: 'Patient Name', minWidth: 170 },
                { id: 'doctorName', label: 'Doctor Name', minWidth: 150 },
                { id: 'appointmentDate', label: 'Appointment Date', minWidth: 130 },
                { id: 'appointmentTime', label: 'Appointment Time', minWidth: 130 },
                { id: 'prescribedMed', label: 'Prescription', minWidth: 250 },
                { id: 'remarks', label: 'Remarks', minWidth: 200 },
            ];
        }
    }, [currentUser?.userType]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const formatDateForDateInput = (dateOfJoining) => {
        if (!dateOfJoining) return 'N/A';
        return moment(new Date(dateOfJoining)).format('YYYY-MM-DD');
    };

    const formatPrescription = (prescribedMed) => {
        if (!prescribedMed || prescribedMed.length === 0) {
            return <span style={{ color: '#999' }}>No medicines prescribed</span>;
        }
        
        return (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {prescribedMed.map((pre, index) => (
                    <div key={pre._id || index} style={{ 
                        marginBottom: '10px', 
                        paddingBottom: '10px',
                        borderBottom: index < prescribedMed.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                        <strong>{pre.medicineId?.name || 'Unknown Medicine'}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            <span>Quantity: {pre.qty || 0}</span><br />
                            <span>Dosage: {pre.dosage || 'N/A'}</span><br />
                            {pre.timing && <span>Timing: {pre.timing}</span>}
                            {pre.duration && <span> | Duration: {pre.duration}</span>}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handlePayment = async (prescriptionId) => {
        setPaymentLoading(true);
        
        try {
            const apiSetQrcode = `${process.env.REACT_APP_SERVER_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/api/paypal/payment`;
            const response = await fetch(apiSetQrcode, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    value: prescriptionId,
                }),
            });
            
            if (response.ok) {
                const json = await response.json();
                window.location.assign(json.link);
            } else {
                throw new Error('Payment initialization failed');
            }
        } catch (error) {
            console.error("Payment error:", error);
            setErrorMessage(error.message || "Failed to initiate payment. Please try again.");
            setErrorSnackbar(true);
            setPaymentLoading(false);
        }
    };

    const handleDownloadReceipt = async (prescriptionId) => {
        setDownloadLoading(true);
        
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/prescription/invoice/${prescriptionId}`,
                {
                    responseType: 'blob',
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            
            // Create download URL
            const downloadUrl = window.URL.createObjectURL(response.data);
            
            // Open PDF in new tab
            window.open(downloadUrl, '_blank');
            
            // Revoke the URL after a delay to allow the download to complete
            setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 1000);
            
            setSuccessMessage("Invoice downloaded successfully!");
            setSuccessSnackbar(true);
        } catch (error) {
            console.error("Download error:", error);
            setErrorMessage(error.response?.data?.message || "Failed to download invoice. Please try again.");
            setErrorSnackbar(true);
        } finally {
            setDownloadLoading(false);
        }
    };

    // Create rows from prescription list
    const rows = useMemo(() => {
        if (!prescriptionList || prescriptionList.length === 0) return [];
        
        return prescriptionList.map((prescription) => {
            const patientName = prescription.appointmentId?.patientId?.userId 
                ? `${prescription.appointmentId.patientId.userId.firstName || ''} ${prescription.appointmentId.patientId.userId.lastName || ''}`.trim()
                : 'Unknown Patient';
            
            const doctorName = prescription.appointmentId?.doctorId?.userId 
                ? `Dr. ${prescription.appointmentId.doctorId.userId.firstName || ''} ${prescription.appointmentId.doctorId.userId.lastName || ''}`.trim()
                : 'Unknown Doctor';
            
            return createData(
                patientName,
                doctorName,
                formatDateForDateInput(prescription.appointmentId?.appointmentDate),
                prescription.appointmentId?.appointmentTime || 'N/A',
                formatPrescription(prescription.prescribedMed),
                prescription.remarks || 'No remarks',
                prescription._id,
                prescription.paid || false
            );
        });
    }, [prescriptionList]);

    // Show loading state
    if (propLoading) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CircularProgress size={40} />
                    <p className="mt-3 text-muted">Loading prescriptions...</p>
                </div>
            </Paper>
        );
    }

    // Show empty state
    if (!prescriptionList || prescriptionList.length === 0) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No prescriptions found.
                </Alert>
            </Paper>
        );
    }

    return (
        <>
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <TableContainer>
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
                                                
                                                if (column.id === 'actionsID' && currentUser?.userType === "Patient") {
                                                    const isPaid = row.paid;
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'center'}>
                                                            {!isPaid ? (
                                                                <Tooltip title="Pay for Prescription" placement="top" arrow>
                                                                    <Button
                                                                        variant="contained"
                                                                        color="success"
                                                                        size="small"
                                                                        startIcon={paymentLoading ? <CircularProgress size={16} color="inherit" /> : <AttachMoneyIcon />}
                                                                        onClick={() => handlePayment(value)}
                                                                        disabled={paymentLoading}
                                                                        sx={{ minWidth: '120px' }}
                                                                    >
                                                                        {paymentLoading ? 'Processing...' : 'Pay Now'}
                                                                    </Button>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip title="Download Invoice" placement="top" arrow>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        size="small"
                                                                        startIcon={downloadLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                                                                        onClick={() => handleDownloadReceipt(value)}
                                                                        disabled={downloadLoading}
                                                                        sx={{ minWidth: '120px' }}
                                                                    >
                                                                        {downloadLoading ? 'Downloading...' : 'Download Invoice'}
                                                                    </Button>
                                                                </Tooltip>
                                                            )}
                                                        </TableCell>
                                                    );
                                                } else if (column.id === 'prescribedMed') {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'left'}>
                                                            {value}
                                                        </TableCell>
                                                    );
                                                } else if (column.id === 'remarks') {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'left'}>
                                                            <Tooltip title={value} placement="top" arrow>
                                                                <span style={{ 
                                                                    display: 'block',
                                                                    maxWidth: '200px',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    {value}
                                                                </span>
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
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
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