import Header from "../Layout/Header/Header";
import Sidebar from "../Layout/Sidebar/Sidebar";
// import styles from './Dashboard.module.css';

import React, { useContext, useEffect, useState } from 'react';

 import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import { Outlet, useNavigate } from "react-router-dom";

import { UserContext } from '../../Context/UserContext';

// const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

export default function Dashboard() {

    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    const {
        currentUser,
        loading
    } = useContext(UserContext);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    // Check authentication

    useEffect(() => {

        if (!loading) {

            if (!currentUser?.userType) {

                navigate('/login');

            }

        }

    }, [currentUser, loading, navigate]);

    // Show loading while checking auth

    if (loading) {

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                Loading...
            </div>
        );

    }

    return (

        <Box sx={{ display: 'flex' }}>

            <CssBaseline />

            <Header
                open={open}
                handleDrawerOpen={handleDrawerOpen}
                headerTitle="Dashboard"
            />

            <Sidebar
                open={open}
                handleDrawerClose={handleDrawerClose}
                handleDrawerOpen={handleDrawerOpen}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3
                }}
            >

                <DrawerHeader />

                <Outlet />

            </Box>

        </Box>

    );

}