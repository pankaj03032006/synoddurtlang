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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';

function createData(Company, Name, Description, Price, actionsID) {
    return { Company, Name, Description, Price, actionsID };
}

export default function MedicineTable({ medicineList, deleteMedicine, loading: propLoading }) {
    const { currentUser } = useContext(UserContext);
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = useState(false);
    const [selectedMedicineId, setSelectedMedicineId] = useState(null);
    const [selectedMedicineName, setSelectedMedicineName] = useState('');
    const [successSnackbar, setSuccessSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorSnackbar, setErrorSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    // Define columns based on user type
    const columns = useMemo(() => {
        if (currentUser?.userType === "Admin") {
            return [
                { id: 'Company', label: 'Company/Brand', minWidth: 170 },
                { id: 'Name', label: 'Medicine Name', minWidth: 170 },
                { id: 'Description', label: 'Description', minWidth: 200 },
                { id: 'Price', label: 'Price', minWidth: 100, align: 'right' },
                { id: 'actionsID', label: 'Actions', minWidth: 120, align: 'center' },
            ];
        } else {
            return [
                { id: 'Company', label: 'Company/Brand', minWidth: 170 },
                { id: 'Name', label: 'Medicine Name', minWidth: 170 },
                { id: 'Description', label: 'Description', minWidth: 200 },
                { id: 'Price', label: 'Price', minWidth: 100, align: 'right' },
            ];
        }
    }, [currentUser?.userType]);

    const handleDeleteDialogueOpen = (medicineId, medicineName) => {
        setSelectedMedicineId(medicineId);
        setSelectedMedicineName(medicineName);
        setOpenConfirmDeleteDialogue(true);
    };

    const handleDeleteDialogueClose = () => {
        setOpenConfirmDeleteDialogue(false);
        setSelectedMedicineId(null);
        setSelectedMedicineName('');
    };

    const handleDeleteMedicine = async () => {
        if (!selectedMedicineId) return;
        
        setDeleteLoading(true);
        
        try {
            await deleteMedicine(selectedMedicineId);
            setSuccessMessage(`Medicine "${selectedMedicineName}" deleted successfully!`);
            setSuccessSnackbar(true);
            handleDeleteDialogueClose();
        } catch (error) {
            console.error("Error deleting medicine:", error);
            setErrorMessage(error.response?.data?.message || "Failed to delete medicine");
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

    const handleEditMedicine = (medicineId) => {
        navigate(`/medicines/edit/${medicineId}`);
    };

    // Create rows from medicine list
    const rows = useMemo(() => {
        if (!medicineList || medicineList.length === 0) return [];
        
        return medicineList.map((medicine) => {
            return createData(
                medicine.company || 'N/A',
                medicine.name || 'N/A',
                medicine.description || 'No description',
                medicine.price || 0,
                medicine._id
            );
        });
    }, [medicineList]);

    // Show loading state
    if (propLoading) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CircularProgress size={40} />
                    <p className="mt-3 text-muted">Loading medicines...</p>
                </div>
            </Paper>
        );
    }

    // Show empty state
    if (!medicineList || medicineList.length === 0) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No medicines found. Click "Add Medicine" to get started.
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
                                                
                                                if (column.id === 'actionsID' && currentUser?.userType === "Admin") {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'center'}>
                                                            <div className="d-flex gap-2 justify-content-center">
                                                                <Tooltip title="Edit Medicine" placement="top" arrow>
                                                                    <EditIcon
                                                                        className="mx-2"
                                                                        style={{ 
                                                                            color: '#ff6600', 
                                                                            fontSize: 28,
                                                                            cursor: 'pointer',
                                                                            transition: 'transform 0.2s'
                                                                        }}
                                                                        onClick={() => handleEditMedicine(value)}
                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="Delete Medicine" placement="top" arrow>
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
                                                } else if (column.id === 'Description') {
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
                                                } else if (column.id === 'Price') {
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'right'}>
                                                            <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                                ₹{parseFloat(value).toFixed(2)}
                                                            </span>
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
                title="Delete Medicine"
                message="Are you sure you want to delete this medicine?"
                itemName={selectedMedicineName}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteMedicine}
                loading={deleteLoading}
                deleteButtonText="Delete Medicine"
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