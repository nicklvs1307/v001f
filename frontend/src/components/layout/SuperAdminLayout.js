import React, { useState, useContext, useMemo } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton,
    ListItemIcon, ListItemText, Box, CssBaseline, Divider, Button, Menu,
    MenuItem as MuiMenuItem, Collapse, Avatar, Badge, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import StarsIcon from '@mui/icons-material/Stars';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DnsIcon from '@mui/icons-material/Dns';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

const drawerWidth = 280;

const menuSections = {
    principal: {
        title: 'Principal',
        items: [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/superadmin/dashboard', roles: [ROLES.SUPER_ADMIN] },
            { text: 'Tenants', icon: <PeopleIcon />, path: '/superadmin/tenants', roles: [ROLES.SUPER_ADMIN] },
            { text: 'Franqueadores', icon: <StorefrontIcon />, path: '/superadmin/franchisors', roles: [ROLES.SUPER_ADMIN] },
        ]
    },
    gestao: {
        title: 'Gestão',
        items: [
            { text: 'Planos e Assinaturas', icon: <AssessmentIcon />, path: '/superadmin/plans', roles: [ROLES.SUPER_ADMIN] },
            { text: 'Cargos e Permissões', icon: <AdminPanelSettingsIcon />, path: '/superadmin/roles', roles: [ROLES.SUPER_ADMIN] },
            { text: 'Gerenciar Admins', icon: <PeopleIcon />, path: '/superadmin/users', roles: [ROLES.SUPER_ADMIN] },
        ]
    },
    sistema: {
        title: 'Sistema',
        items: [
            { text: 'Configurações WhatsApp', icon: <WhatsAppIcon />, path: '/superadmin/whatsapp-config', roles: [ROLES.SUPER_ADMIN] },
            { text: 'Pool de Disparo', icon: <DnsIcon />, path: '/superadmin/sender-pool', roles: [ROLES.SUPER_ADMIN] },
        ]
    },
    relatorios: {
        title: 'Relatórios',
        items: [
            { text: 'Visão Geral do Sistema', path: '/superadmin/reports/system-overview', roles: [ROLES.SUPER_ADMIN] },
            { text: 'Relatórios por Restaurante', path: '/superadmin/reports/tenant-reports', roles: [ROLES.SUPER_ADMIN] },
        ]
    }
};

const SuperAdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openReports, setOpenReports] = useState(false);
    const theme = useTheme();

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
        navigate('/superadmin/profile');
        handleClose();
    };

    const handleReportsClick = () => {
        setOpenReports(!openReports);
    };

    const getPageTitle = () => {
        const allItems = [
            ...menuSections.principal.items,
            ...menuSections.gestao.items,
            ...menuSections.sistema.items,
            { text: 'Relatórios', icon: <AssessmentIcon />, roles: [ROLES.SUPER_ADMIN], onClick: handleReportsClick, open: openReports, children: menuSections.relatorios.items },
        ];
        
        for (const section of Object.values(menuSections)) {
            for (const item of section.items) {
                if (item.path === location.pathname) {
                    return item.text;
                }
            }
        }
        
        for (const item of menuSections.relatorios.items) {
            if (item.path === location.pathname) {
                return item.text;
            }
        }
        
        return 'Painel Super Admin';
    };

    const renderMenuItem = (item, isChild = false) => (
        <ListItemButton
            key={item.text}
            onClick={item.children ? item.onClick : () => navigate(item.path)}
            selected={!item.children && location.pathname === item.path}
            sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                py: 1.5,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': { bgcolor: 'primary.light' },
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 600 }
                },
                '&:hover': { bgcolor: 'action.hover' }
            }}
        >
            <ListItemIcon sx={{ 
                color: 'text.secondary', 
                minWidth: 40,
                justifyContent: 'center'
            }}>
                {item.icon}
            </ListItemIcon>
            <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 400
                }} 
            />
            {item.children ? (item.open ? <ExpandLess /> : <ExpandMore />) : null}
        </ListItemButton>
    );

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ p: 2.5, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <StarsIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: 'text.primary' }}>
                            VOLTAKI
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Super Admin
                        </Typography>
                    </Box>
                </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
                {Object.entries(menuSections).map(([key, section]) => (
                    <Box key={key} sx={{ mb: 2 }}>
                        <Typography variant="overline" sx={{ 
                            px: 2, 
                            color: 'text.secondary', 
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            letterSpacing: 1.5,
                            display: 'block'
                        }}>
                            {section.title}
                        </Typography>
                        {key === 'relatorios' ? (
                            <List component="div" disablePadding>
                                <ListItemButton
                                    onClick={handleReportsClick}
                                    selected={location.pathname.includes('/superadmin/reports')}
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        mb: 0.5,
                                        py: 1.5,
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                                        <AssessmentIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Relatórios" />
                                    {openReports ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={openReports} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {section.items.map((child) => (
                                            <ListItemButton
                                                key={child.text}
                                                sx={{ pl: 4, borderRadius: 2, mx: 1, mb: 0.5 }}
                                                onClick={() => navigate(child.path)}
                                                selected={location.pathname === child.path}
                                            >
                                                <ListItemText 
                                                    primary={child.text}
                                                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </List>
                        ) : (
                            <List component="div" disablePadding>
                                {section.items.map((item) => renderMenuItem(item))}
                            </List>
                        )}
                    </Box>
                ))}
            </Box>
            
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<StarsIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Voltar ao App
                </Button>
            </Box>
        </Box>
    );

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
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {getPageTitle()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton sx={{ color: 'text.secondary' }}>
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <Button
                            onClick={handleMenu}
                            sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 1.5
                            }}
                        >
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                                {user?.name?.charAt(0) || 'A'}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.2 }}>
                                    {user?.name || 'Super Admin'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Administrador
                                </Typography>
                            </Box>
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: { mt: 1, minWidth: 180 }
                            }}
                        >
                            <MuiMenuItem onClick={handleProfile}>
                                <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                                <ListItemText>Meu Perfil</ListItemText>
                            </MuiMenuItem>
                            <MuiMenuItem onClick={handleLogout}>
                                <ListItemIcon><StarsIcon fontSize="small" /></ListItemIcon>
                                <ListItemText>Sair</ListItemText>
                            </MuiMenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth,
                            borderRight: '1px solid',
                            borderColor: 'divider'
                        },
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
                    minHeight: '100vh'
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default SuperAdminLayout;
