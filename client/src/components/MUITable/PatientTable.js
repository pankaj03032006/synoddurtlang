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
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import moment from 'moment';
import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';
import { UserContext } from '../../Context/UserContext';

const GREEN = '#31b372';
const GREEN_DARK = '#28995f';
const RED = '#d32f2f';

function createData(name, email, phone, gender, address, dob, actionsID, rawName) {
    return { name, email, phone, gender, address, dob, actionsID, rawName };
}

const getInitials = (first, last) => {
    const a = (first || '').trim().charAt(0).toUpperCase();
    const b = (last || '').trim().charAt(0).toUpperCase();
    return `${a}${b}` || '?';
};

// Gender chip colors
const genderColor = (g) => {
    if (!g) return { bg: '#eee', color: '#666' };
    const lower = g.toLowerCase();
    if (lower === 'male') return { bg: 'rgba(25,118,210,0.12)', color: '#1565c0' };
    if (lower === 'female') return { bg: 'rgba(194,24,91,0.12)', color: '#ad1457' };
    return { bg: 'rgba(49,179,114,0.12)', color: GREEN_DARK };
};

export default function PatientTable({ patientList, deletePatient, loading: propLoading }) {
    const navigate = useNavigate();
    const { currentUser } = React.useContext(UserContext);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = React.useState(false);
    const [selectedPatientId, setSelectedPatientId] = React.useState(null);
    const [selectedPatientName, setSelectedPatientName] = React.useState('');
    const [query, setQuery] = React.useState('');
    const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    const isAdmin = currentUser?.userType === 'Admin';

    // -------- Columns --------
    const columns = React.useMemo(() => {
        const base = [
            { id: 'name', label: 'Patient', minWidth: 200 },
            { id: 'email', label: 'Email', minWidth: 200 },
            { id: 'phone', label: 'Phone', minWidth: 130 },
            { id: 'gender', label: 'Gender', minWidth: 100 },
            { id: 'address', label: 'Address', minWidth: 200 },
            { id: 'dob', label: 'Date of Birth', minWidth: 120 },
        ];
        if (isAdmin) {
            base.push({ id: 'actionsID', label: 'Actions', minWidth: 120, align: 'center' });
        }
        return base;
    }, [isAdmin]);

    // -------- Handlers --------
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
            notify('success', `"${selectedPatientName}" deleted successfully.`);
            handleDeleteDialogueClose();
        } catch (error) {
            console.error('Error deleting patient:', error);
            notify(
                'error',
                error.response?.data?.message || 'Failed to delete patient.'
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

    const handleEditPatient = (patientId) => navigate(`/patients/edit/${patientId}`);

    const formatDate = (date) => {
        if (!date) return '—';
        return moment(date).format('DD MMM YYYY');
    };

    // -------- Rows --------
    const rows = React.useMemo(() => {
        if (!patientList || patientList.length === 0) return [];
        return patientList.map((patient) => {
            const u = patient.userId || {};
            const fullName =
                `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown Patient';
            return createData(
                fullName,
                u.email || '',
                patient.phone || '',
                patient.gender || '',
                patient.address || '',
                formatDate(patient.dob),
                patient._id,
                fullName
            );
        });
    }, [patientList]);

    // -------- Filter --------
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.phone.toLowerCase().includes(q) ||
                r.gender.toLowerCase().includes(q)
        );
    }, [rows, query]);

    // -------- Loading --------
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
                    Loading patients...
                </Typography>
            </Paper>
        );
    }

    // -------- Empty --------
    if (!patientList || patientList.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    border: '1px solid #eee',
                    borderRadius: 3,
                    mt: 2,
                }}
            >
                <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                    <PeopleAltIcon sx={{ fontSize: 56, color: '#bbb', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        No patients yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Patients will appear here once they register.
                    </Typography>
                    {isAdmin && (
                        <Button
                            component={NavLink}
                            to="/patients/add"
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            sx={{
                                bgcolor: GREEN,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: GREEN_DARK },
                            }}
                        >
                            Add Patient
                        </Button>
                    )}
                </Box>
            </Paper>
        );
    }

    // -------- Main --------
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
                        <PeopleAltIcon sx={{ color: GREEN }} />
                        <Typography variant="h6" fontWeight={700}>
                            Patients
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
                        placeholder="Search by name, email, phone..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(0);
                        }}
                        sx={{ width: { xs: '100%', sm: 300 } }}
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
                    <Table stickyHeader aria-label="patient table">
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
                                            No patients match "{query}"
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
                                                                <Tooltip title="Edit patient" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleEditPatient(value)}
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
                                                                <Tooltip title="Delete patient" arrow>
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
                                                    const initials = getInitials(...row.name.split(' '));
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
                                                                        bgcolor: 'rgba(49,179,114,0.15)',
                                                                        color: GREEN_DARK,
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

                                                // ---- Phone ----
                                                if (column.id === 'phone') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Typography variant="body2">
                                                                {value || '—'}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }

                                                // ---- Gender chip ----
                                                if (column.id === 'gender') {
                                                    if (!value) {
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
                                                    const c = genderColor(value);
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Chip
                                                                label={value}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: c.bg,
                                                                    color: c.color,
                                                                    fontWeight: 600,
                                                                    fontSize: 12,
                                                                }}
                                                            />
                                                        </TableCell>
                                                    );
                                                }

                                                // ---- Address ----
                                                if (column.id === 'address') {
                                                    const short =
                                                        value && value.length > 40
                                                            ? value.slice(0, 40) + '…'
                                                            : value;
                                                    return (
                                                        <TableCell
                                                            key={column.id}
                                                            sx={{
                                                                maxWidth: 240,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {value ? (
                                                                <Tooltip title={value} arrow placement="top">
                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                        sx={{ cursor: 'help' }}
                                                                    >
                                                                        {short}
                                                                    </Typography>
                                                                </Tooltip>
                                                            ) : (
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.disabled"
                                                                >
                                                                    —
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    );
                                                }

                                                // ---- DOB ----
                                                if (column.id === 'dob') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Typography variant="body2">
                                                                {value}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }

                                                return (
                                                    <TableCell
                                                        key={column.id}
                                                        align={column.align || 'left'}
                                                    >
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
                title="Delete Patient"
                message="This will permanently remove the patient and their records."
                itemName={selectedPatientName}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeletePatient}
                loading={deleteLoading}
                deleteButtonText="Delete Patient"
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
                    icon={
                        snack.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />
                    }
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