import React, { useState, useContext, useEffect, useMemo } from 'react';
import { UserContext } from '../../Context/UserContext';
import {
    Box, Card, CardContent, Typography, TextField, Button, Alert,
    CircularProgress, Divider, Avatar, Chip, InputAdornment, IconButton,
    Snackbar, Skeleton, Stack, Grid,
} from '@mui/material';
import {
    Visibility, VisibilityOff, Person, Lock, Email, Phone, Home,
    Save, CheckCircle, Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';

const GREEN = '#295d43';
const GREEN_DARK = '#2b754f';

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

export default function Settings() {
    const { token } = useContext(UserContext);

    const [profile, setProfile] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const strength = useMemo(() => passwordStrength(passwordData.newPassword), [passwordData.newPassword]);

    // --------------------------------------------------
    // Load profile
    // --------------------------------------------------
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user/profile', {
                    headers: { authorization: `Bearer ${token}` },
                });
                if (response.data.message === 'success') {
                    setProfile(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setSnack({
                    open: true, severity: 'error',
                    message: error.response?.data?.errors?.[0] || 'Failed to load profile.',
                });
            } finally {
                setFetchLoading(false);
            }
        };
        if (token) fetchProfile();
        else setFetchLoading(false);
    }, [token]);

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    const handleProfileChange = (e) =>
        setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePasswordChange = (e) =>
        setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    // --------------------------------------------------
    // Save profile
    // --------------------------------------------------
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const response = await axios.put(
                'http://localhost:5000/user/profile',
                profile,
                { headers: { authorization: `Bearer ${token}` } }
            );
            if (response.data.message === 'success') {
                notify('success', 'Profile updated successfully.');
            } else {
                notify('error', response.data.errors?.[0] || 'Failed to update profile.');
            }
        } catch (error) {
            notify(
                'error',
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                'Error updating profile.'
            );
        } finally {
            setProfileLoading(false);
        }
    };

    // --------------------------------------------------
    // Change password
    // --------------------------------------------------
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            notify('error', 'New passwords do not match.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            notify('error', 'Password must be at least 6 characters.');
            return;
        }
        if (passwordData.newPassword === passwordData.currentPassword) {
            notify('error', 'New password must be different from the current one.');
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await axios.put(
                'http://localhost:5000/user/change-password',
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                },
                { headers: { authorization: `Bearer ${token}` } }
            );
            if (response.data.message === 'success') {
                notify('success', 'Password changed successfully.');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                notify('error', response.data.errors?.[0] || 'Error changing password.');
            }
        } catch (error) {
            notify(
                'error',
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                'Error changing password.'
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Your Profile';

    // --------------------------------------------------
    // Loading skeleton
    // --------------------------------------------------
    if (fetchLoading) {
        return (
            <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Skeleton variant="text" width={200} height={48} />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
            {/* ---------- Page Header ---------- */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage your personal information and account security.
                </Typography>
            </Box>

            {/* ---------- Profile Header Card ---------- */}
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
                            fontSize: 28, fontWeight: 700,
                            border: '2px solid rgba(255,255,255,0.5)',
                        }}
                    >
                        {getInitials(profile.firstName, profile.lastName)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="h5" fontWeight={700}>
                            {fullName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                            {profile.email && (
                                <Chip
                                    icon={<Email sx={{ color: '#fff !important' }} />}
                                    label={profile.email}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                />
                            )}
                            {profile.phone && (
                                <Chip
                                    icon={<Phone sx={{ color: '#fff !important' }} />}
                                    label={profile.phone}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                />
                            )}
                        </Stack>
                    </Box>
                </CardContent>
            </Card>

            {/* ---------- Two Column Layout ---------- */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 3,
                }}
            >
                {/* ========== Profile Information ========== */}
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Person sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                Profile Information
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Update your personal details.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <form onSubmit={handleProfileSubmit}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    label="First Name"
                                    name="firstName"
                                    value={profile.firstName || ''}
                                    onChange={handleProfileChange}
                                    required
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Last Name"
                                    name="lastName"
                                    value={profile.lastName || ''}
                                    onChange={handleProfileChange}
                                    required
                                    fullWidth
                                    size="small"
                                />
                            </Box>

                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={profile.email || ''}
                                onChange={handleProfileChange}
                                required
                                fullWidth
                                size="small"
                                sx={{ mt: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Phone"
                                name="phone"
                                value={profile.phone || ''}
                                onChange={handleProfileChange}
                                fullWidth
                                size="small"
                                sx={{ mt: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Address"
                                name="address"
                                multiline
                                rows={3}
                                value={profile.address || ''}
                                onChange={handleProfileChange}
                                fullWidth
                                size="small"
                                sx={{ mt: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                            <Home fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={profileLoading}
                                    startIcon={
                                        profileLoading
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
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>

                {/* ========== Change Password ========== */}
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Lock sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                Change Password
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Choose a strong password to keep your account secure.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <form onSubmit={handlePasswordSubmit}>
                            <TextField
                                label="Current Password"
                                name="currentPassword"
                                type={showCurrent ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                fullWidth
                                size="small"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setShowCurrent((s) => !s)}
                                                edge="end"
                                            >
                                                {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="New Password"
                                name="newPassword"
                                type={showNew ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                fullWidth
                                size="small"
                                sx={{ mt: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setShowNew((s) => !s)}
                                                edge="end"
                                            >
                                                {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password strength meter */}
                            {passwordData.newPassword && (
                                <Box sx={{ mt: 1 }}>
                                    <Box
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: '#eee',
                                            overflow: 'hidden',
                                        }}
                                    >
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
                                label="Confirm New Password"
                                name="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                fullWidth
                                size="small"
                                sx={{ mt: 2 }}
                                error={
                                    passwordData.confirmPassword.length > 0 &&
                                    passwordData.newPassword !== passwordData.confirmPassword
                                }
                                helperText={
                                    passwordData.confirmPassword.length > 0 &&
                                    passwordData.newPassword !== passwordData.confirmPassword
                                        ? 'Passwords do not match'
                                        : ' '
                                }
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

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={passwordLoading}
                                    startIcon={
                                        passwordLoading
                                            ? <CircularProgress size={16} color="inherit" />
                                            : <Lock />
                                    }
                                    sx={{
                                        backgroundColor: GREEN,
                                        '&:hover': { backgroundColor: GREEN_DARK },
                                        textTransform: 'none',
                                        px: 3,
                                    }}
                                >
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>

            {/* ---------- Feedback Snackbar ---------- */}
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