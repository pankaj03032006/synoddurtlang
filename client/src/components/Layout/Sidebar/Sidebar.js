import { styled } from '@mui/material/styles'; // Removed unused useTheme
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
// Removed unused CssBaseline
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// Removed unused DashboardOutlinedIcon
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
// Removed unused PersonAddAltIcon
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { UserContext } from '../../../Context/UserContext';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ReceiptIcon from '@mui/icons-material/Receipt';
import GroupIcon from '@mui/icons-material/Group';
// Removed unused MedicalServicesIcon
import DashboardIcon from '@mui/icons-material/Dashboard';
// Removed unused PersonIcon
import PeopleIcon from '@mui/icons-material/People';
// Removed unused DescriptionIcon
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import Tooltip from '@mui/material/Tooltip';
import styles from './Sidebar.module.css';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('xs')]: {
        width: 0,
    },
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export default function Sidebar({ open, handleDrawerClose, handleDrawerOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, signOutUser } = useContext(UserContext);
    const [hoveredItem, setHoveredItem] = useState(null);

    const getRolePrefix = () => {
        if (currentUser?.userType === 'Admin') return '/admin/dashboard';
        if (currentUser?.userType === 'Doctor') return '/doctor/dashboard';
        if (currentUser?.userType === 'Patient') return '/patient/dashboard';
        return '';
    };

    const prefix = getRolePrefix();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            signOutUser();
            navigate('/login');
        }
    };

    // Menu items configuration based on user role
    const getMenuItems = () => {
        const commonItems = [
            {
                key: 'dashboard',
                title: 'Dashboard',
                icon: <DashboardIcon />,
                path: `${prefix}`,
                roles: ['Admin', 'Doctor', 'Patient']
            },
            {
                key: 'appointments',
                title: 'Appointments',
                icon: <CalendarTodayOutlinedIcon />,
                path: `${prefix}/appointments`,
                roles: ['Admin', 'Doctor', 'Patient']
            },
            {
                key: 'prescriptions',
                title: 'Prescriptions',
                icon: <ReceiptIcon />,
                path: `${prefix}/prescriptions`,
                roles: ['Admin', 'Doctor', 'Patient']
            }
        ];

        const adminOnlyItems = [
            {
                key: 'users',
                title: 'User Management',
                icon: <GroupIcon />,
                path: `${prefix}/users`,
                roles: ['Admin']
            },
            {
                key: 'patients',
                title: 'Patients',
                icon: <AccessibleForwardIcon />,
                path: `${prefix}/patients`,
                roles: ['Admin']
            },
            {
                key: 'doctors',
                title: 'Doctors',
                icon: <LocalHospitalIcon />,
                path: `${prefix}/doctors`,
                roles: ['Admin']
            },
            {
                key: 'medicines',
                title: 'Medicine Inventory',
                icon: <VaccinesIcon />,
                path: `${prefix}/medicines`,
                roles: ['Admin']
            }
        ];

        const doctorOnlyItems = [
            {
                key: 'mypatients',
                title: 'My Patients',
                icon: <PeopleIcon />,
                path: `${prefix}/mypatients`,
                roles: ['Doctor']
            },
            {
                key: 'medicines',
                title: 'Medicines',
                icon: <VaccinesIcon />,
                path: `${prefix}/medicines`,
                roles: ['Doctor']
            }
        ];

        let items = [...commonItems];
        
        if (currentUser?.userType === 'Admin') {
            items = [...items, ...adminOnlyItems];
        } else if (currentUser?.userType === 'Doctor') {
            items = [...items, ...doctorOnlyItems];
        }
        
        // Filter items based on user role
        items = items.filter(item => item.roles.includes(currentUser?.userType));
        
        return items;
    };

    const bottomItems = [
        {
            key: 'profile',
            title: 'My Profile',
            icon: <AccountBoxIcon />,
            path: `${prefix}/profile`,
            roles: ['Admin', 'Doctor', 'Patient']
        },
        {
            key: 'settings',
            title: 'Settings',
            icon: <SettingsIcon />,
            path: `${prefix}/settings`,
            roles: ['Admin', 'Doctor', 'Patient']
        },
        {
            key: 'help',
            title: 'Help & Support',
            icon: <HelpIcon />,
            path: `${prefix}/help`,
            roles: ['Admin', 'Doctor', 'Patient']
        }
    ];

    const menuItems = getMenuItems();

    const renderMenuItem = (item) => {
        const isSelected = location.pathname === item.path;
        
        return (
            <ListItem key={item.key} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={!open ? item.title : ''} placement="right">
                    <ListItemButton
                        component={NavLink}
                        to={item.path}
                        selected={isSelected}
                        onMouseEnter={() => setHoveredItem(item.key)}
                        onMouseLeave={() => setHoveredItem(null)}
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                            py: 1,
                            mx: 1,
                            my: 0.5,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                                backgroundColor: '#1b4f32',
                                '&:hover': {
                                    backgroundColor: '#143d26',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: '#fff',
                                },
                                '& .MuiListItemText-primary': {
                                    color: '#fff',
                                    fontWeight: 600,
                                },
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(27, 79, 50, 0.8)',
                                transform: 'translateX(4px)',
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 3 : 'auto',
                                justifyContent: 'center',
                                color: '#fff',
                                transition: 'transform 0.3s ease',
                                transform: hoveredItem === item.key ? 'scale(1.1)' : 'scale(1)',
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                            primary={item.title} 
                            sx={{ 
                                opacity: open ? 1 : 0,
                                '& .MuiListItemText-primary': {
                                    fontWeight: isSelected ? 600 : 400,
                                    fontSize: '0.9rem',
                                }
                            }} 
                        />
                    </ListItemButton>
                </Tooltip>
            </ListItem>
        );
    };

    return (
        <Drawer 
            className={styles.sidebar} 
            variant="permanent" 
            open={open} 
            onMouseEnter={handleDrawerOpen} 
            onMouseLeave={handleDrawerClose}
            PaperProps={{ 
                sx: { 
                    backgroundColor: '#31b372', 
                    color: 'white',
                    border: 'none',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                } 
            }}
        >
            <DrawerHeader>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        opacity: open ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        ml: 2,
                        fontSize: '1.1rem'
                    }}
                >
                    {open && 'Synod'}
                </Typography>
                <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
                    {open ? <ChevronLeftIcon /> : <MenuIcon />}
                </IconButton>
            </DrawerHeader>
            
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
            
            {/* Main Navigation */}
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map(renderMenuItem)}
            </List>

            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />

            {/* Bottom Navigation Items */}
            <List>
                {bottomItems.map(renderMenuItem)}
            </List>

            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />

            {/* Logout Button */}
            <List>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <Tooltip title={!open ? 'Logout' : ''} placement="right">
                        <ListItemButton
                            onClick={handleLogout}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                py: 1,
                                mx: 1,
                                my: 0.5,
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#d32f2f',
                                    transform: 'translateX(4px)',
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: '#fff',
                                }}
                            >
                                <LogoutOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Logout" 
                                sx={{ 
                                    opacity: open ? 1 : 0,
                                    '& .MuiListItemText-primary': {
                                        fontWeight: 500,
                                    }
                                }} 
                            />
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
            </List>

            {/* Footer with user info when sidebar is open */}
            {open && currentUser && (
                <>
                    <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
                    <div className={styles.userInfoFooter}>
                        <div className={styles.userAvatar}>
                            {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
                        </div>
                        <div className={styles.userDetails}>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                {currentUser.firstName} {currentUser.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                {currentUser.userType}
                            </Typography>
                        </div>
                    </div>
                </>
            )}
        </Drawer>
    );
}