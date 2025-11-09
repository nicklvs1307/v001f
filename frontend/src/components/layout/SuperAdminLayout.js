import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    CssBaseline,
    Divider,
    Button,
    Menu,
    MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import StarsIcon from '@mui/icons-material/Stars';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DnsIcon from '@mui/icons-material/Dns';

import AssessmentIcon from '@mui/icons-material/Assessment'; // Importar o ícone de relatórios

const drawerWidth = 250;

const SuperAdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/dashboard/profile'); // Navigate to the normal dashboard profile
        handleClose();
    };

    const menuItems = useMemo(() => [
        { text: 'Voltar ao Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: [ROLES.SUPER_ADMIN] },
        { text: 'Tenants', icon: <PeopleIcon />, path: '/superadmin/tenants', roles: [ROLES.SUPER_ADMIN] },
        { text: 'Configurações WhatsApp', icon: <WhatsAppIcon />, path: '/superadmin/whatsapp-config', roles: [ROLES.SUPER_ADMIN] },
        { text: 'Pool de Disparo', icon: <DnsIcon />, path: '/superadmin/sender-pool', roles: [ROLES.SUPER_ADMIN] },
        {
            text: 'Relatórios', icon: <AssessmentIcon />, roles: [ROLES.SUPER_ADMIN],
            children: [
                { text: 'Visão Geral do Sistema', path: '/superadmin/reports/system-overview', roles: [ROLES.SUPER_ADMIN] },
                { text: 'Relatórios por Restaurante', path: '/superadmin/reports/tenant-reports', roles: [ROLES.SUPER_ADMIN] },
            ],
        },
    ], []);

    const getPageTitle = () => {
        const currentItem = menuItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.text : 'Painel Super Admin';
    };

    const drawer = (
        <div>
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white' }}>Super Admin</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            <List>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                    >
                        <ListItemIcon sx={{ color: 'white' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                ))}
            </List>
        </div>
    );

    // Basic protection, assuming PrivateRoute handles the main role check
    if (user?.role?.name !== ROLES.SUPER_ADMIN) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h4">Acesso não autorizado.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    borderBottom: '1px solid #e3e6f0',
                    boxShadow: 'none',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {getPageTitle()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton color="inherit">
                            <NotificationsIcon />
                        </IconButton>
                        <Button
                            color="inherit"
                            onClick={handleMenu}
                            sx={{ ml: 2, textTransform: 'none' }}
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                        >
                            <AccountCircle sx={{ mr: 1 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography variant="body2" component="span">
                                    {user?.name || 'Super Admin'}
                                </Typography>
                            </Box>
                        </Button>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleProfile}>Ver Perfil</MenuItem>
                            <MenuItem onClick={handleLogout}>Sair</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
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
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: 'background.default',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default SuperAdminLayout;
