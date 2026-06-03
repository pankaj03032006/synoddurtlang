import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../Context/UserContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import axios from 'axios';

export default function Settings() {
    const {  token } = useContext(UserContext);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('https://hospital-management-system-2-dni5.onrender.com/user/profile', {
                    headers: { authorization: `Bearer ${token}` }
                });
                if (response.data.message === "success") {
                    setProfile(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setFetchLoading(false);
            }
        };
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put('https://hospital-management-system-2-dni5.onrender.com/user/profile',
                profile,
                { headers: { authorization: `Bearer ${token}` } }
            );
            if (response.data.message === "success") {
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            }
        } catch (error) {
            setMessage({ text: 'Error updating profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.put('https://hospital-management-system-2-dni5.onrender.com/user/change-password',
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                { headers: { authorization: `Bearer ${token}` } }
            );
            if (response.data.message === "success") {
                setMessage({ text: 'Password changed successfully!', type: 'success' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: response.data.errors?.[0] || 'Error changing password', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error changing password', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Settings</Typography>
            
            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}
            
            <div className="row">
                <div className="col-md-6">
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Profile Information</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <form onSubmit={handleProfileSubmit}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={profile.firstName || ''}
                                    onChange={handleProfileChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={profile.lastName || ''}
                                    onChange={handleProfileChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={profile.email || ''}
                                    onChange={handleProfileChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={profile.phone || ''}
                                    onChange={handleProfileChange}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    multiline
                                    rows={2}
                                    value={profile.address || ''}
                                    onChange={handleProfileChange}
                                    margin="normal"
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="col-md-6">
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Change Password</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <form onSubmit={handlePasswordSubmit}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    margin="normal"
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Box>
    );
}