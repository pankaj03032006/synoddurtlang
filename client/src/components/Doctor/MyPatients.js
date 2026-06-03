// src/components/Doctor/MyPatients.js
import React, { useState, useEffect } from 'react'; // Removed unused useContext
// Removed unused UserContext import
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { NavLink } from 'react-router-dom';

export default function MyPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get('https://hospital-management-system-2-dni5.onrender.com/doctor/patients', {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.message === "success") {
                    setPatients(response.data.patients);
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError('Failed to load patients');
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                My Patients
            </Typography>
            <div className="row">
                {patients.length === 0 ? (
                    <div className="col-12">
                        <Alert severity="info">No patients found.</Alert>
                    </div>
                ) : (
                    patients.map((patient) => (
                        <div className="col-md-4 mb-3" key={patient._id}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {patient.firstName} {patient.lastName}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2">
                                        Email: {patient.email}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2">
                                        Phone: {patient.phone || 'N/A'}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2">
                                        Age: {patient.age || 'N/A'}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        component={NavLink} 
                                        to={`/doctor/dashboard/patient/history/${patient._id}`}
                                        color="primary"
                                    >
                                        View History
                                    </Button>
                                    <Button 
                                        size="small" 
                                        component={NavLink} 
                                        to={`/doctor/dashboard/appointments?patient=${patient._id}`}
                                        color="secondary"
                                    >
                                        Book Appointment
                                    </Button>
                                </CardActions>
                            </Card>
                        </div>
                    ))
                )}
            </div>
        </Box>
    );
}