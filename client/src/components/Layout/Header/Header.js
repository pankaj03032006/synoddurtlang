import styles from './Header.module.css'
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles'; // Removed unused useTheme
import { useNavigate } from "react-router-dom"; // Removed unused useLocation
import React, { useContext, useState } from 'react';
import { UserContext } from '../../../Context/UserContext';
// Removed unused AccountCircle
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Header = ({ open, handleDrawerOpen, headerTitle }) => {
  const navigate = useNavigate();
  // Removed unused location
  const { isLoggedIn, currentUser, signOutUser } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  // Removed unused setNotifications - notifications state is read-only
  const [notifications] = useState([
    { id: 1, text: "New appointment booking", time: "5 min ago", read: false },
    { id: 2, text: "Patient feedback received", time: "1 hour ago", read: false },
    { id: 3, text: "System update completed", time: "2 hours ago", read: true },
  ]);

  const redirectToHome = () => {
    navigate("/dashboard");
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleSignOut = () => {
    signOutUser();
    handleClose();
    navigate("/login");
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleSettings = () => {
    handleClose();
    navigate("/settings");
  };

  const getDashboardPath = () => {
    if (!currentUser) return "/dashboard";
    switch (currentUser.userType) {
      case 'Admin':
        return "/admin/dashboard";
      case 'Doctor':
        return "/doctor/dashboard";
      case 'Patient':
        return "/patient/dashboard";
      default:
        return "/dashboard";
    }
  };

  const getInitials = () => {
    if (!currentUser) return "GU";
    return `${currentUser.firstName?.charAt(0) || ''}${currentUser.lastName?.charAt(0) || ''}`;
  };

  const getRoleColor = () => {
    if (!currentUser) return "#6c757d";
    switch (currentUser.userType) {
      case 'Admin':
        return "#dc3545";
      case 'Doctor':
        return "#28a745";
      case 'Patient':
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar position="fixed" open={open} className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: 'none' }),
          }}
          className={styles.menuButton}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h4" 
          noWrap 
          component="div" 
          onClick={redirectToHome} 
          className={styles.logo}
        >
          <span className={styles.logoGreen}>Synod</span>
          <span className={styles.logoGrey}> Hospital</span>
        </Typography>

        {isLoggedIn && (
          <div className={styles.rightSection}>
            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                aria-label="show notifications"
                aria-controls="notification-menu"
                aria-haspopup="true"
                onClick={handleNotificationMenu}
                color="inherit"
                className={styles.notificationBtn}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications Menu */}
            <Menu
              id="notification-menu"
              anchorEl={notificationAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
              PaperProps={{
                style: {
                  width: 320,
                  maxHeight: 400,
                },
              }}
            >
              <MenuItem sx={{ fontWeight: 'bold', justifyContent: 'space-between' }}>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: 12, color: '#666' }}>
                    {unreadCount} unread
                  </span>
                )}
              </MenuItem>
              <Divider />
              {notifications.length === 0 ? (
                <MenuItem onClick={handleNotificationClose}>
                  <ListItemText primary="No notifications" />
                </MenuItem>
              ) : (
                notifications.map((notification) => (
                  <MenuItem key={notification.id} onClick={handleNotificationClose}>
                    <ListItemText 
                      primary={notification.text} 
                      secondary={notification.time}
                      primaryTypographyProps={{
                        style: { fontWeight: notification.read ? 'normal' : 'bold' }
                      }}
                    />
                  </MenuItem>
                ))
              )}
              <Divider />
              <MenuItem onClick={handleNotificationClose}>
                <ListItemText primary="View all notifications" sx={{ textAlign: 'center', color: '#31b372' }} />
              </MenuItem>
            </Menu>

            {/* User Account Menu */}
            <div className={styles.accountIcon}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                className={styles.userButton}
              >
                <Avatar 
                  sx={{ 
                    width: 42, 
                    height: 42, 
                    bgcolor: getRoleColor(),
                    marginRight: 1.5
                  }}
                >
                  {getInitials()}
                </Avatar>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {currentUser?.firstName} {currentUser?.lastName}
                  </span>
                  <span className={styles.userRole} style={{ color: getRoleColor() }}>
                    {currentUser?.userType}
                  </span>
                </div>
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  style: {
                    width: 250,
                  },
                }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Profile</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => {
                  handleClose();
                  navigate(getDashboardPath());
                }}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Dashboard</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => {
                  handleClose();
                  navigate("/appointments");
                }}>
                  <ListItemIcon>
                    <CalendarTodayIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Appointments</ListItemText>
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleSettings}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => {
                  handleClose();
                  navigate("/help");
                }}>
                  <ListItemIcon>
                    <HelpIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Help & Support</ListItemText>
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleSignOut} sx={{ color: '#dc3545' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: '#dc3545' }} />
                  </ListItemIcon>
                  <ListItemText>Sign Out</ListItemText>
                </MenuItem>
              </Menu>
            </div>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;