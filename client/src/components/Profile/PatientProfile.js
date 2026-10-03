import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Box, Card, CardContent, Typography, TextField, Button, Alert,
    CircularProgress, Divider, Avatar, Chip, Stack, InputAdornment,
    IconButton, Snackbar, Skeleton, MenuItem,
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import {
    Person, Lock, Email, Badge, Save, Visibility, VisibilityOff,
    CheckCircle, Error as ErrorIcon, Phone, Home, Wc, Cake,
} from '@mui/icons-material';
import axios from "axios";
import { UserContext } from '../../Context/UserContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const GREEN = '#31b372';
const GREEN_DARK = '#28995f';

const GENDERS = ['Male', 'Female', 'Other'];

const getInitials = (first, last) => {
    const a = (first || '').trim().charAt(0).toUpperCase();
    const b = (last || '').trim().charAt(0).toUpperCase();
    return `${a}${b}` || '?';
};

const passwordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#ddd' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const map = [
        { label: 'Very weak', color: '#e53935' },
        { label: 'Weak', color: '#fb8c00' },
        { label: 'Fair', color: '#fdd835' },
        { label: 'Good', color: '#7cb342' },
        { label: 'Strong', color: GREEN },
    ];
    return { score, ...map[Math.min(score, 4)] };
};

function PatientProfile() {
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);

    const [patientId, setPatientId] = useState('');
    const [userId, setUserId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    // ---------- FETCH ----------
    const getPatientById = useCallback(async () => {
        if (!currentUser?.userId) {
            notify('error', 'User information not available.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.get(
                `${API}/profile/patient/${currentUser.userId}`,
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setPatientId(data._id || '');
            setUserId(data.userId?._id || '');
            setFirstName(data.userId?.firstName || '');
            setLastName(data.userId?.lastName || '');
            setEmail(data.userId?.email || '');
            setUsername(data.userId?.username || '');
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setGender(data.gender || '');
            setDob(data.dob ? data.dob.slice(0, 10) : '');
            // 🚨 Do NOT preload password — it's a hash, not the plain value.
        } catch (error) {
            console.error("Error fetching patient profile:", error);
            notify(
                'error',
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch patient profile."
            );
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        getPatientById();
    }, [getPatientById]);

    // ---------- SUBMIT ----------
    const updatePatient = async (e) => {
        e.preventDefault();

        const wantsPasswordChange = password.length > 0 || confirmPassword.length > 0;

        if (wantsPasswordChange) {
            if (password !== confirmPassword) {
                notify('error', 'Password and Confirm Password do not match.');
                return;
            }
            if (password.trim().length <= 6) {
                notify('error', 'Password must be more than 6 characters.');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const payload = {
                firstName,
                lastName,
                username,
                email,
                phone,
                address,
                gender,
                dob,
                userId,
            };

            // Only include password fields when the user is changing it
            if (wantsPasswordChange) {
                payload.password = password;
                payload.confirmPassword = confirmPassword;
            }

            await axios.patch(
                `${API}/patients/${patientId}`,
                payload,
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setPassword('');
            setConfirmPassword('');

            notify('success', 'Profile updated successfully.');
        } catch (error) {
            console.error("Update error:", error);
            const errors =
                error.response?.data?.errors ||
                (error.response?.data?.message ? [error.response.data.message] : null) ||
                [error.message || "Failed to update profile"];
            notify('error', errors.join(', '));
        } finally {
            setIsSubmitting(false);
        }
    };

    const fullName = `${firstName} ${lastName}`.trim() || 'Patient';
    const strength = useMemo(() => passwordStrength(password), [password]);
    const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

    // ---------- LOADING ----------
    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
                <Skeleton variant="text" width={220} height={48} />
                <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 3, my: 3 }} />
                <Skeleton variant="rectangular" height={620} sx={{ borderRadius: 3 }} />
            </Box>
        );
    }

    // ---------- UI ----------
    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Update Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Keep your personal information up to date.
                </Typography>
            </Box>

            {/* Profile banner */}
            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                    color: '#fff',
                }}
            >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                    <Avatar
                        sx={{
                            width: 72, height: 72,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            fontSize: 26, fontWeight: 700,
                            border: '2px solid rgba(255,255,255,0.5)',
                        }}
                    >
                        {getInitials(firstName, lastName)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="h5" fontWeight={700}>
                            {fullName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                            {gender && (
                                <Chip
                                    label={gender}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                />
                            )}
                            {email && (
                                <Chip
                                    icon={<Email sx={{ color: '#fff !important' }} />}
                                    label={email}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                />
                            )}
                        </Stack>
                    </Box>
                </CardContent>
            </Card>

            {/* Form */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Person sx={{ color: GREEN }} />
                        <Typography variant="h6" fontWeight={700}>
                            Personal Information
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Leave password fields blank to keep your current password.
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={updatePatient}>
                        <Grid2 container spacing={2}>
                            <Grid2 item xs={12} sm={6}>
                                <TextField
                                    label="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                />
                            </Grid2>
                            <Grid2 item xs={12} sm={6}>
                                <TextField
                                    label="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                />
                            </Grid2>

                            <Grid2 item xs={12} sm={6}>
                                <TextField
                                    label="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Badge fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>
                            <Grid2 item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>

                            <Grid2 item xs={12} sm={6}>
                                <TextField
                                    label="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>
                            <Grid2 item xs={12} sm={6}>
                                <TextField
                                    select
                                    label="Gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Wc fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                >
                                    <MenuItem value="">Select Gender</MenuItem>
                                    {GENDERS.map((g) => (
                                        <MenuItem key={g} value={g}>{g}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid2>

                            <Grid2 item xs={12}>
                                <TextField
                                    label="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment
                                                position="start"
                                                sx={{ alignSelf: 'flex-start', mt: 1 }}
                                            >
                                                <Home fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>

                            <Grid2 item xs={12} sm={6}>
                                <TextField
                                    label="Date of Birth"
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Cake fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>
                        </Grid2>

                        <Divider sx={{ my: 3 }}>
                            <Chip
                                label="Change Password (optional)"
                                size="small"
                                icon={<Lock sx={{ fontSize: 16 }} />}
                                sx={{ bgcolor: 'rgba(49,179,114,0.1)', color: GREEN_DARK }}
                            />
                        </Divider>

                        <TextField
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            size="small"
                            disabled={isSubmitting}
                            placeholder="Leave blank to keep current"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowPassword((s) => !s)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {password && (
                            <Box sx={{ mt: 1 }}>
                                <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#eee', overflow: 'hidden' }}>
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: `${(strength.score / 4) * 100}%`,
                                            bgcolor: strength.color,
                                            transition: 'width 0.3s ease, background-color 0.3s ease',
                                        }}
                                    />
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{ color: strength.color, fontWeight: 600, mt: 0.5, display: 'block' }}
                                >
                                    {strength.label}
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            label="Confirm Password"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                            size="small"
                            disabled={isSubmitting}
                            error={mismatch}
                            helperText={mismatch ? 'Passwords do not match' : ' '}
                            sx={{ mt: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowConfirm((s) => !s)}
                                            edge="end"
                                        >
                                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                                sx={{ textTransform: 'none' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                startIcon={
                                    isSubmitting
                                        ? <CircularProgress size={16} color="inherit" />
                                        : <Save />
                                }
                                sx={{
                                    backgroundColor: GREEN,
                                    '&:hover': { backgroundColor: GREEN_DARK },
                                    textTransform: 'none',
                                    px: 3,
                                }}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snack.severity}
                    icon={snack.severity === 'success' ? <CheckCircle /> : <ErrorIcon />}
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    elevation={6}
                    sx={{ borderRadius: 2 }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PatientProfile;