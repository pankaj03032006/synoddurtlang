import * as React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, Tooltip, CircularProgress, Alert,
    Snackbar, Box, Typography, IconButton, Chip, Stack, Button,
    InputAdornment, TextField, Divider, Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';
import { UserContext } from '../../Context/UserContext';

const GREEN = '#31b372';
const GREEN_DARK = '#28995f';
const RED = '#d32f2f';

function createData(name, email, role, actionsID, rawName) {
    return { name, email, role, actionsID, rawName };
}

const getInitials = (first, last) => {
    const a = (first || '').trim().charAt(0).toUpperCase();
    const b = (last || '').trim().charAt(0).toUpperCase();
    return `${a}${b}` || '?';
};

// Deterministic avatar colors based on role
const roleColor = (role) => {
    switch ((role || '').toLowerCase()) {
        case 'admin':
            return { bg: 'rgba(255,152,0,0.15)', color: '#e65100', chip: '#ff9800' };
        case 'doctor':
            return { bg: 'rgba(49,179,114,0.15)', color: GREEN_DARK, chip: GREEN };
        case 'patient':
            return { bg: 'rgba(25,118,210,0.12)', color: '#1565c0', chip: '#1976d2' };
        default:
            return { bg: 'rgba(158,158,158,0.15)', color: '#616161', chip: '#9e9e9e' };
    }
};

const roleIcon = (role) => {
    switch ((role || '').toLowerCase()) {
        case 'admin':
            return <AdminPanelSettingsIcon sx={{ fontSize: 14 }} />;
        case 'doctor':
            return <LocalHospitalIcon sx={{ fontSize: 14 }} />;
        case 'patient':
            return <PersonIcon sx={{ fontSize: 14 }} />;
        default:
            return undefined;
    }
};

export default function UserTable({ userList, deleteUser, loading: propLoading }) {
    const navigate = useNavigate();
    const { currentUser } = React.useContext(UserContext);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState(null);
    const [selectedUserName, setSelectedUserName] = React.useState('');
    const [query, setQuery] = React.useState('');
    const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    const isAdmin = currentUser?.userType === 'Admin';

    // ---------- Columns ----------
    const columns = React.useMemo(() => {
        const base = [
            { id: 'name', label: 'User', minWidth: 220 },
            { id: 'email', label: 'Email', minWidth: 240 },
            { id: 'role', label: 'Role', minWidth: 140 },
        ];
        if (isAdmin) {
            base.push({ id: 'actionsID', label: 'Actions', minWidth: 120, align: 'center' });
        }
        return base;
    }, [isAdmin]);

    // ---------- Handlers ----------
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
            notify('success', `"${selectedUserName}" deleted successfully.`);
            handleDeleteDialogueClose();
        } catch (error) {
            console.error('Error deleting user:', error);
            notify(
                'error',
                error.response?.data?.message || 'Failed to delete user.'
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleChangePage = (_, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleEditUser = (userId) => navigate(`/users/edit/${userId}`);

    // ---------- Rows ----------
    const rows = React.useMemo(() => {
        if (!userList || userList.length === 0) return [];
        return userList.map((user) => {
            const fullName =
                `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
            return createData(
                fullName,
                user.email || '',
                user.userType || 'N/A',
                user._id,
                fullName
            );
        });
    }, [userList]);

    // ---------- Filter ----------
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.role.toLowerCase().includes(q)
        );
    }, [rows, query]);

    // ---------- Loading ----------
    if (propLoading) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    border: '1px solid #eee',
                    borderRadius: 3,
                    p: 4,
                    mt: 2,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={40} sx={{ color: GREEN }} />
                </Box>
                <Typography textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                    Loading users...
                </Typography>
            </Paper>
        );
    }

    // ---------- Empty ----------
    if (!userList || userList.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{ border: '1px solid #eee', borderRadius: 3, mt: 2 }}
            >
                <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                    <PeopleIcon sx={{ fontSize: 56, color: '#bbb', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        No users yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Users will appear here once they register.
                    </Typography>
                    {isAdmin && (
                        <Button
                            component={NavLink}
                            to="/users/add"
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            sx={{
                                bgcolor: GREEN,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: GREEN_DARK },
                            }}
                        >
                            Add User
                        </Button>
                    )}
                </Box>
            </Paper>
        );
    }

    // ---------- Main ----------
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
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon sx={{ color: GREEN }} />
                        <Typography variant="h6" fontWeight={700}>
                            Users
                        </Typography>
                        <Chip
                            label={filtered.length}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(49,179,114,0.15)',
                                color: GREEN_DARK,
                                fontWeight: 700,
                            }}
                        />
                    </Box>

                    <TextField
                        size="small"
                        placeholder="Search by name, email, or role..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(0);
                        }}
                        sx={{ width: { xs: '100%', sm: 320 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Divider />

                <TableContainer sx={{ maxHeight: 560 }}>
                    <Table stickyHeader aria-label="user table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
                                        sx={{
                                            minWidth: column.minWidth,
                                            fontWeight: 700,
                                            bgcolor: '#fafafa',
                                            color: '#555',
                                            textTransform: 'uppercase',
                                            fontSize: 12,
                                            letterSpacing: 0.5,
                                            borderBottom: '2px solid #eee',
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                                        <SearchIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            No users match "{query}"
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered
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
                                            {columns.map((column) => {
                                                const value = row[column.id];

                                                // ---- Actions ----
                                                if (column.id === 'actionsID' && isAdmin) {
                                                    return (
                                                        <TableCell key={column.id} align="center">
                                                            <Stack
                                                                direction="row"
                                                                spacing={0.5}
                                                                justifyContent="center"
                                                            >
                                                                <Tooltip title="Edit user" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleEditUser(value)}
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
                                                                <Tooltip title="Delete user" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() =>
                                                                            handleDeleteDialogueOpen(value, row.rawName)
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
                                                    );
                                                }

                                                // ---- Name with avatar ----
                                                if (column.id === 'name') {
                                                    const parts = row.name.split(' ');
                                                    const initials = getInitials(parts[0], parts[1] || '');
                                                    const rc = roleColor(row.role);
                                                    return (
                                                        <TableCell key={column.id}>
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
                                                                        bgcolor: rc.bg,
                                                                        color: rc.color,
                                                                        fontSize: 14,
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {initials}
                                                                </Avatar>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                >
                                                                    {value}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    );
                                                }

                                                // ---- Email ----
                                                if (column.id === 'email') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {value || '—'}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }

                                                // ---- Role chip ----
                                                if (column.id === 'role') {
                                                    if (!value || value === 'N/A') {
                                                        return (
                                                            <TableCell key={column.id}>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.disabled"
                                                                >
                                                                    —
                                                                </Typography>
                                                            </TableCell>
                                                        );
                                                    }
                                                    const c = roleColor(value);
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Chip
                                                                icon={roleIcon(value)}
                                                                label={value}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: c.bg,
                                                                    color: c.color,
                                                                    fontWeight: 700,
                                                                    fontSize: 12,
                                                                    textTransform: 'capitalize',
                                                                    '& .MuiChip-icon': {
                                                                        color: `${c.color} !important`,
                                                                    },
                                                                }}
                                                            />
                                                        </TableCell>
                                                    );
                                                }

                                                return (
                                                    <TableCell key={column.id} align={column.align || 'left'}>
                                                        {value || '—'}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider />

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={filtered.length}
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
                title="Delete User"
                message="This will permanently remove the user account and revoke access."
                itemName={selectedUserName}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteUser}
                loading={deleteLoading}
                deleteButtonText="Delete User"
            />

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