import React, { useState, useContext, useMemo } from 'react';
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
    MenuItem as MuiMenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

const drawerWidth = 250;

const FranchisorLayout = () => {
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
        navigate('/dashboard/profile'); // Assuming profile is a shared route
        handleClose();
    };

    const menuItems = useMemo(() => [
        { text: 'Dashboard Agregado', icon: <DashboardIcon />, path: '/franchisor/dashboard', roles: [ROLES.FRANQUEADOR] },
        { text: 'Meus Franqueados', icon: <PeopleIcon />, path: '/franchisor/franchisees', roles: [ROLES.FRANQUEADOR] },
        { text: 'Gerenciar Usuários', icon: <GroupIcon />, path: '/franchisor/users', roles: [ROLES.FRANQUEADOR] },
        { text: 'Relatórios', icon: <AssessmentIcon />, path: '/franchisor/reports', roles: [ROLES.FRANQUEADOR] },
        // Add other franchisor-specific menu items here
    ], []);

    const getPageTitle = () => {
        const currentItem = menuItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.text : 'Painel do Franqueador';
    };



    const drawer = (
        <div>
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white' }}>Franqueador</Typography>
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

    if (user?.role?.name !== ROLES.FRANQUEADOR) {
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
                                    {user?.name || 'Franqueador'}
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
                            <MuiMenuItem onClick={handleProfile}>Ver Perfil</MuiMenuItem>
                            <MuiMenuItem onClick={handleLogout}>Sair</MuiMenuItem>
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

export default FranchisorLayout;
