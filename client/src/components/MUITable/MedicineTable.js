import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, Tooltip, CircularProgress, Alert,
    Snackbar, Box, Typography, IconButton, Chip, Stack, Button,
    InputAdornment, TextField, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MedicationIcon from '@mui/icons-material/Medication';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import ConfirmDeleteDialogue from '../MUIDialogueBox/ConfirmDeleteDialogue';

const GREEN = '#31b372';
const GREEN_DARK = '#28995f';
const RED = '#d32f2f';

function createData(company, name, description, price, actionsID) {
    return { company, name, description, price, actionsID };
}

export default function MedicineTable({ medicineList, deleteMedicine, loading: propLoading }) {
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [openConfirmDeleteDialogue, setOpenConfirmDeleteDialogue] = useState(false);
    const [selectedMedicineId, setSelectedMedicineId] = useState(null);
    const [selectedMedicineName, setSelectedMedicineName] = useState('');
    const [query, setQuery] = useState('');
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    const isAdmin = currentUser?.userType === 'Admin';

    const columns = useMemo(() => {
        const base = [
            { id: 'name', label: 'Medicine', minWidth: 200 },
            { id: 'company', label: 'Company / Brand', minWidth: 170 },
            { id: 'description', label: 'Description', minWidth: 240 },
            { id: 'price', label: 'Price', minWidth: 100, align: 'right' },
        ];
        if (isAdmin) {
            base.push({ id: 'actionsID', label: 'Actions', minWidth: 120, align: 'center' });
        }
        return base;
    }, [isAdmin]);

    // -------- Handlers --------
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
            notify('success', `"${selectedMedicineName}" deleted successfully.`);
            handleDeleteDialogueClose();
        } catch (error) {
            console.error('Error deleting medicine:', error);
            notify(
                'error',
                error.response?.data?.message || 'Failed to delete medicine.'
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

    const handleEditMedicine = (medicineId) => navigate(`/medicines/edit/${medicineId}`);

    // -------- Rows + filter --------
    const rows = useMemo(() => {
        if (!medicineList || medicineList.length === 0) return [];
        return medicineList.map((m) =>
            createData(
                m.company || 'N/A',
                m.name || 'N/A',
                m.description || '',
                typeof m.price === 'number' ? m.price : parseFloat(m.price) || 0,
                m._id
            )
        );
    }, [medicineList]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.company.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q)
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
                    Loading medicines...
                </Typography>
            </Paper>
        );
    }

    // -------- Empty --------
    if (!medicineList || medicineList.length === 0) {
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
                    <MedicationIcon sx={{ fontSize: 56, color: '#bbb', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        No medicines yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Add your first medicine to start building the inventory.
                    </Typography>
                    {isAdmin && (
                        <Button
                            component={NavLink}
                            to="/medicines/add"
                            variant="contained"
                            startIcon={<AddCircleIcon />}
                            sx={{
                                bgcolor: GREEN,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: GREEN_DARK },
                            }}
                        >
                            Add Medicine
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
                {/* ---- Header row: title + search ---- */}
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
                        <MedicationIcon sx={{ color: GREEN }} />
                        <Typography variant="h6" fontWeight={700}>
                            Medicine Inventory
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
                        placeholder="Search medicines..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(0);
                        }}
                        sx={{ width: { xs: '100%', sm: 280 } }}
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
                    <Table stickyHeader aria-label="medicine table">
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
                                            No medicines match "{query}"
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

                                                // Actions
                                                if (column.id === 'actionsID' && isAdmin) {
                                                    return (
                                                        <TableCell key={column.id} align="center">
                                                            <Stack
                                                                direction="row"
                                                                spacing={0.5}
                                                                justifyContent="center"
                                                            >
                                                                <Tooltip title="Edit medicine" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleEditMedicine(value)}
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
                                                                <Tooltip title="Delete medicine" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleDeleteDialogueOpen(value, row.name)}
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

                                                // Name column with icon
                                                if (column.id === 'name') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: 1.5,
                                                                        bgcolor: 'rgba(49,179,114,0.12)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0,
                                                                    }}
                                                                >
                                                                    <MedicationIcon
                                                                        sx={{ color: GREEN_DARK, fontSize: 18 }}
                                                                    />
                                                                </Box>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {value}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    );
                                                }

                                                // Company
                                                if (column.id === 'company') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {value}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }

                                                // Description with tooltip
                                                if (column.id === 'description') {
                                                    const short =
                                                        value && value.length > 60
                                                            ? value.slice(0, 60) + '…'
                                                            : value;
                                                    return (
                                                        <TableCell
                                                            key={column.id}
                                                            sx={{
                                                                maxWidth: 280,
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
                                                                    fontStyle="italic"
                                                                >
                                                                    No description
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    );
                                                }

                                                // Price
                                                if (column.id === 'price') {
                                                    return (
                                                        <TableCell key={column.id} align="right">
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={700}
                                                                sx={{ color: GREEN_DARK }}
                                                            >
                                                                ₹{Number(value).toFixed(2)}
                                                            </Typography>
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
                title="Delete Medicine"
                message="This will permanently remove the medicine from inventory."
                itemName={selectedMedicineName}
                open={openConfirmDeleteDialogue}
                handleClose={handleDeleteDialogueClose}
                handleDelete={handleDeleteMedicine}
                loading={deleteLoading}
                deleteButtonText="Delete Medicine"
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