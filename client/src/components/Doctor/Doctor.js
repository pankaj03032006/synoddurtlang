import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from '../../Context/UserContext';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

export default function User() {
    const { currentUser, isLoggedIn } = useContext(UserContext);
    
    // Check if user is logged in and has patient role
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    // Check if user has patient role
    if (currentUser?.role !== 'Patient') {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Access Denied. You don't have permission to access this page.
                </Alert>
            </Box>
        );
    }
    
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Outlet />
        </Box>
    );
}