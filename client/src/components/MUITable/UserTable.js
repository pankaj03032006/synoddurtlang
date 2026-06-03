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

const columns = [
    { id: 'Name', label: 'User Name', minWidth: 170 },
    { id: 'Email', label: 'Email', minWidth: 200 },
    { id: 'Role', label: 'Role', minWidth: 130 },
    { id: 'actionsID', label: 'Actions', minWidth: 120, align: 'center' },
];

function createData(Name, Email, Role, actionsID) {
    return { Name, Email, Role, actionsID };
}

export default function UserTable({ userList, deleteUser, loading: propLoading }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState(null);
    const [selectedUserName, setSelectedUserName] = React.useState('');
    const [successSnackbar, setSuccessSnackbar] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');
    const [errorSnackbar, setErrorSnackbar] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const navigate = useNavigate();

    const handleDeleteDialogueOpen = (userId, userName) => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setOpenConfirmDeleteDialogue(true);
    };

    const handleDeleteDialogueClose = () => {
        setOpenConfirmDeleteDialogue(false);
        setSelectedUserId(null);
        setSelectedUserName('');
    };

    const handleDeleteUser = async () => {
        if (!selectedUserId) return;
        
        setDeleteLoading(true);
        
        try {
            await deleteUser(selectedUserId);
            setSuccessMessage(`User "${selectedUserName}" deleted successfully!`);
            setSuccessSnackbar(true);
            handleDeleteDialogueClose();
        } catch (error) {
            console.error("Error deleting user:", error);
            setErrorMessage(error.response?.data?.message || "Failed to delete user");
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

    const handleEditUser = (userId) => {
        navigate(`/users/edit/${userId}`);
    };

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return { bg: '#ff9800', color: '#fff' };
            case 'doctor':
                return { bg: '#4caf50', color: '#fff' };
            case 'patient':
                return { bg: '#2196f3', color: '#fff' };
            default:
                return { bg: '#9e9e9e', color: '#fff' };
        }
    };

    // Create rows from user list
    const rows = React.useMemo(() => {
        if (!userList || userList.length === 0) return [];
        
        return userList.map((user) => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            return createData(
                fullName || 'Unknown User',
                user.email || 'N/A',
                user.userType || 'N/A',
                user._id
            );
        });
    }, [userList]);

    // Show loading state
    if (propLoading) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CircularProgress size={40} />
                    <p className="mt-3 text-muted">Loading users...</p>
                </div>
            </Paper>
        );
    }

    // Show empty state
    if (!userList || userList.length === 0) {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', marginTop: 2, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", p: 4 }}>
                <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No users found.
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
                                                                <Tooltip title="Edit User" placement="top" arrow>
                                                                    <EditIcon
                                                                        className="mx-2"
                                                                        style={{ 
                                                                            color: '#ff6600', 
                                                                            fontSize: 28,
                                                                            cursor: 'pointer',
                                                                            transition: 'transform 0.2s'
                                                                        }}
                                                                        onClick={() => handleEditUser(value)}
                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="Delete User" placement="top" arrow>
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
                                                } else if (column.id === 'Role') {
                                                    const badgeColor = getRoleBadgeColor(value);
                                                    return (
                                                        <TableCell key={column.id} align={column.align || 'left'}>
                                                            <span style={{
                                                                display: 'inline-block',
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '500',
                                                                backgroundColor: badgeColor.bg,
                                                                color: badgeColor.color,
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {value}
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
                title="Delete User"
                message="Are you sure you want to delete this user?"
                itemName={selectedUserName}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteUser}
                loading={deleteLoading}
                deleteButtonText="Delete User"
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