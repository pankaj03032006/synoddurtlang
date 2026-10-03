import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Box, Card, CardContent, CardActions, Typography, Button, Avatar,
    Chip, Divider, Alert, TextField, InputAdornment,
    Stack, Skeleton,
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import CakeIcon from '@mui/icons-material/Cake';
import HistoryIcon from '@mui/icons-material/History';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const GREEN = '#31b372';
const GREEN_DARK = '#28995f';

const getInitials = (first, last) => {
    const a = (first || '').trim().charAt(0).toUpperCase();
    const b = (last || '').trim().charAt(0).toUpperCase();
    return `${a}${b}` || '?';
};

const fullName = (p) => {
    const u = p?.userId || {};
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown Patient';
};

export default function MyPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const { data } = await axios.get(`${API}/patients`, {
                    headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setPatients(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.errors?.[0] ||
                    'Failed to load patients.'
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // Client-side search filter
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return patients;
        return patients.filter((p) => {
            const u = p.userId || {};
            return (
                (u.firstName || '').toLowerCase().includes(q) ||
                (u.lastName || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (p.phone || '').toLowerCase().includes(q)
            );
        });
    }, [patients, query]);

    // -------- LOADING --------
    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
                <Skeleton variant="text" width={220} height={48} sx={{ mb: 3 }} />
                <Grid2 container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid2 item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
                        </Grid2>
                    ))}
                </Grid2>
            </Box>
        );
    }

    // -------- ERROR --------
    if (error) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            </Box>
        );
    }

    // -------- UI --------
    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
            {/* ================= HEADER ================= */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: '50%',
                            bgcolor: 'rgba(49,179,114,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <PeopleAltIcon sx={{ color: GREEN }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            My Patients
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {patients.length} {patients.length === 1 ? 'patient' : 'patients'} under your care
                        </Typography>
                    </Box>
                </Box>

                <TextField
                    size="small"
                    placeholder="Search by name, email, or phone"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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

            {/* ================= EMPTY STATES ================= */}
            {patients.length === 0 && (
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <PersonOffIcon sx={{ fontSize: 56, color: '#bbb', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            No patients yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Patients will appear here once you've seen them in an appointment.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {patients.length > 0 && filtered.length === 0 && (
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                        <SearchIcon sx={{ fontSize: 48, color: '#bbb', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            No matches for "{query}"
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try a different name, email, or phone number.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* ================= PATIENT CARDS ================= */}
            {filtered.length > 0 && (
                <Grid2 container spacing={3}>
                    {filtered.map((patient) => {
                        const u = patient.userId || {};
                        return (
                            <Grid2 item xs={12} sm={6} md={4} key={patient._id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: 3,
                                        border: '1px solid #eee',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
                                            borderColor: GREEN,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flex: 1, p: 3 }}>
                                        {/* Avatar + name */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    width: 56, height: 56,
                                                    bgcolor: 'rgba(49,179,114,0.15)',
                                                    color: GREEN_DARK,
                                                    fontSize: 20, fontWeight: 700,
                                                }}
                                            >
                                                {getInitials(u.firstName, u.lastName)}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" fontWeight={700} noWrap>
                                                    {fullName(patient)}
                                                </Typography>
                                                <Chip
                                                    label={`ID: ${String(patient._id).slice(-6)}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(49,179,114,0.08)',
                                                        color: GREEN_DARK,
                                                        fontWeight: 600,
                                                        height: 20,
                                                        fontSize: 11,
                                                        mt: 0.3,
                                                    }}
                                                />
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ mb: 2 }} />

                                        {/* Details */}
                                        <Stack spacing={1}>
                                            <DetailRow
                                                icon={<EmailIcon sx={{ fontSize: 16 }} />}
                                                label="Email"
                                                value={u.email || 'N/A'}
                                            />
                                            <DetailRow
                                                icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                                                label="Phone"
                                                value={patient.phone || 'N/A'}
                                            />
                                            <DetailRow
                                                icon={<WcIcon sx={{ fontSize: 16 }} />}
                                                label="Gender"
                                                value={patient.gender || 'N/A'}
                                            />
                                            {patient.dateOfBirth && (
                                                <DetailRow
                                                    icon={<CakeIcon sx={{ fontSize: 16 }} />}
                                                    label="DOB"
                                                    value={new Date(patient.dateOfBirth).toLocaleDateString()}
                                                />
                                            )}
                                        </Stack>
                                    </CardContent>

                                    <Divider />

                                    <CardActions sx={{ p: 2, gap: 1 }}>
                                        <Button
                                            component={NavLink}
                                            to={`/doctor/dashboard/patient/history/${patient._id}`}
                                            variant="outlined"
                                            size="small"
                                            startIcon={<HistoryIcon />}
                                            fullWidth
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                color: GREEN_DARK,
                                                borderColor: GREEN,
                                                '&:hover': {
                                                    borderColor: GREEN_DARK,
                                                    bgcolor: 'rgba(49,179,114,0.06)',
                                                },
                                            }}
                                        >
                                            History
                                        </Button>
                                        <Button
                                            component={NavLink}
                                            to={`/doctor/dashboard/appointments?patient=${patient._id}`}
                                            variant="contained"
                                            size="small"
                                            startIcon={<EventAvailableIcon />}
                                            fullWidth
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                bgcolor: GREEN,
                                                '&:hover': { bgcolor: GREEN_DARK },
                                            }}
                                        >
                                            Book
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid2>
                        );
                    })}
                </Grid2>
            )}
        </Box>
    );
}

// ---- Small sub-component for each detail line ----
function DetailRow({ icon, label, value }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
            <Box sx={{ color: GREEN, display: 'flex' }}>{icon}</Box>
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 52 }}>
                {label}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {value}
            </Typography>
        </Stack>
    );
}