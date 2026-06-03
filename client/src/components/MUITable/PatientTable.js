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
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';
import moment from 'moment';

const columns = [
    { id: 'Name', label: 'Patient Name', minWidth: 170 },
    { id: 'Email', label: 'Email', minWidth: 170 },
    { id: 'Phone', label: 'Phone', minWidth: 130 },
    { id: 'Gender', label: 'Gender', minWidth: 100 },
    { id: 'Address', label: 'Address', minWidth: 200 },
    { id: 'DOB', label: 'Date of Birth', minWidth: 120 },
    { id: 'actionsID', label: 'Actions', minWidth: 120, align: 'center' },
];

function createData(Name, Email, Phone, Gender, Address, DOB, actionsID) {
    return { Name, Email, Phone, Gender, Address, DOB, actionsID };
}

export default function PatientTable({ patientList, deletePatient, loading: propLoading }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = React.useState(false);
    const [selectedPatientId, setSelectedPatientId] = React.useState(null);
    const [selectedPatientName, setSelectedPatientName] = React.useState('');
    const [successSnackbar, setSuccessSnackbar] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');
    const [errorSnackbar, setErrorSnackbar] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const navigate = useNavigate();

    const handleDeleteDialogueOpen = (patientId, patientName) => {
        setSelectedPatientId(patientId);
        setSelectedPatientName(patientName);
        setOpenConfirmDeleteDialogue(true);
    };

    const handleDeleteDialogueClose = () => {
        setOpenConfirmDeleteDialogue(false);
        setSelectedPatientId(null);
        setSelectedPatientName('');
    };

    const handleDeletePatient = async () => {
        if (!selectedPatientId) return;
        
        setDeleteLoading(true);
        
        try {
            await deletePatient(selectedPatientId);
            setSuccessMessage(`Patient "${selectedPatientName}" deleted successfully!`);
            setSuccessSnackbar(true);
            handleDeleteDialogueClose();
        } catch (error) {
            console.error("Error deleting patient:", error);
            setErrorMessage(error.response?.data?.message || "Failed to delete patient");
            setErrorSnackbar(true);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleEditPatient = (patientId) => {
        navigate(`/patients/edit/${patientId}`);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return moment(date).format('DD/MM/YYYY');
    };

    // Create rows from patient list
    const rows = React.useMemo(() => {
        if (!patientList || patientList.length === 0) return [];
        
        return patientList.map((patient) => {
            const fullName = patient.userId 
                ? `${patient.userId.firstName || ''} ${patient.userId.lastName || ''}`.trim()
                : 'Unknown Patient';
            
            return createData(
                fullName,
                patient.userId?.email || 'N/A',
                patient.phone || 'N/A',
                patient.gender || 'N/A',
                patient.address || 'N/A',
                formatDate(patient.dob),
                patient._id
            );
        });
    }, [patientList]);

    // Show loading state
    if (propLoading) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CircularProgress size={40} />
                    <p className="mt-3 text-muted">Loading patients...</p>
                </div>
            </Paper>
        );
    }

    // Show empty state
    if (!patientList || patientList.length === 0) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No patients found. Click "Add Patient" to get started.
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
                                                
                                                if (column.id === 'actionsID') {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'center'}>
                                                            <div className="d-flex gap-2 justify-content-center">
                                                                <Tooltip title="Edit Patient" placement="top" arrow>
                                                                    <EditIcon
                                                                        className="mx-2"
                                                                        style={{ 
                                                                            color: '#ff6600', 
                                                                            fontSize: 28,
                                                                            cursor: 'pointer',
                                                                            transition: 'transform 0.2s'
                                                                        }}
                                                                        onClick={() => handleEditPatient(value)}
                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="Delete Patient" placement="top" arrow>
                                                                    <DeleteIcon
                                                                        className="mx-2"
                                                                        style={{ 
                                                                            color: '#dc3545', 
                                                                            fontSize: 28,
                                                                            cursor: 'pointer',
                                                                            transition: 'transform 0.2s'
                                                                        }}
                                                                        onClick={() => handleDeleteDialogueOpen(value, row.Name)}
                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                    />
                                                                </Tooltip>
                                                            </div>
                                                        </TableCell>
                                                    );
                                                } else if (column.id === 'Address') {
                                                    return (
                                                        <TableCell 
                                                            key={column.id} 
                                                            align={column.align || 'left'}
                                                            sx={{ 
                                                                maxWidth: 250,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            <Tooltip title={value} placement="top" arrow>
                                                                <span>{value || '-'}</span>
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

            {/* Delete Confirmation Dialogue */}
            <ConfirmDeleteDialogue
                title="Delete Patient"
                message="Are you sure you want to delete this patient?"
                itemName={selectedPatientName}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeletePatient}
                loading={deleteLoading}
                deleteButtonText="Delete Patient"
            />

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