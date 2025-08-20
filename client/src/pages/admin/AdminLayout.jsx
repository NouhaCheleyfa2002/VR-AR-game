import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GamesIcon from '@mui/icons-material/SportsEsports';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LayersIcon from '@mui/icons-material/Layers';
import ExtensionIcon from '@mui/icons-material/Extension';
import QrCodeIcon from '@mui/icons-material/QrCode';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MovieIcon from '@mui/icons-material/Movie';
import PeopleIcon from '@mui/icons-material/People';
import { Margin } from '@mui/icons-material';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Escape Games', icon: <GamesIcon />, path: '/admin/game' },
  { text: 'Scenarios', icon: <LayersIcon />, path: '/admin/scenario' },
  { text: 'Levels', icon: <LayersIcon />, path: '/admin/levels' },
  { text: 'Puzzles', icon: <ExtensionIcon />, path: '/admin/puzzles' },
  { text: 'QR Codes', icon: <QrCodeIcon />, path: '/admin/QR' },
  { text: 'Rooms', icon: <MeetingRoomIcon />, path: '/admin/rooms' },

  { text: 'Feedbacks', icon: <FeedbackIcon />, path: '/admin/feedbacks' },
  { text: 'Gameplay session', icon: <GamesIcon />, path: '/admin/sessions' },
  { text: 'Media Library', icon: <MovieIcon />, path: '/admin/media' },
  { text: 'Reports', icon: <FeedbackIcon />, path: '/admin/report' },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map(({ text, icon, path }) => (
          <ListItemButton
            key={text}
            selected={location.pathname === path}
            onClick={() => {
              navigate(path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

    const { logout } = useContext(AuthContext);
  
    const handleLogout = () => {
      logout();
      navigate('/login');
    };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: theme => theme.zIndex.drawer + 1, backgroundColor: '#003049' }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" paddingRight={130} >
            Admin Dashboard
          </Typography>
          <button onClick={handleLogout} className='text-blue-950'>Logout</button>
        </Toolbar>
       
      </AppBar>

      {/* Sidebar for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box',  backgroundColor: '#003049',
            color: 'white' },
          display: { xs: 'none', sm: 'block' },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Sidebar for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: '#f1faee', 
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
