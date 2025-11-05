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
    Collapse,
    Menu,
    MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarsIcon from '@mui/icons-material/Stars'; // New import
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import SupportSpeedDial from '../../components/common/SupportSpeedDial';

import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const drawerWidth = 250;
const collapsedDrawerWidth = 60;

const DashboardLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true); // New state for permanent drawer
    const [openSubMenu, setOpenSubMenu] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [pageTitle, setPageTitle] = useState('Dashboard');

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

    const handleSettings = () => {
        navigate('/profile');
        handleClose();
    };

    const handleSubMenuClick = (text) => {
        setOpenSubMenu(prev => ({ ...prev, [text]: !prev[text] }));
    };

    const handleDrawerOpen = () => {
        setDrawerOpen(!drawerOpen);
    };

    const menuItems = useMemo(() => [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
        {
            text: 'Super Admin', icon: <SettingsIcon />, roles: [ROLES.SUPER_ADMIN],
            children: [
                { text: 'Tenants', path: '/dashboard/locatarios', roles: [ROLES.SUPER_ADMIN] },
                { text: 'WhatsApp', path: '/dashboard/config-whatsapp', roles: [ROLES.SUPER_ADMIN] },
            ],
        },
        {
            text: 'Atendentes', icon: <PeopleIcon />, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            children: [
                { text: 'Listar Atendentes', path: '/dashboard/atendentes', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Painel', path: '/dashboard/atendentes-dashboard', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Metas', path: '/dashboard/metas-atendentes', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN], badge: 'NOVO' },
            ],
        },
        {
            text: 'Clientes', icon: <PeopleIcon />, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            children: [
                { text: 'Painel', path: '/dashboard/clientes/dashboard', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Gestão de Clientes', path: '/dashboard/clientes', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Aniversariantes', path: '/dashboard/clientes/birthdays', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
            ],
        },
        {
            text: 'Pesquisas', icon: <AssignmentIcon />, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            children: [
                { text: 'Listar Pesquisas', path: '/dashboard/pesquisas', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Criar Nova Pesquisa', path: '/dashboard/pesquisas/create', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Critérios', path: '/dashboard/criterios', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
            ],
        },
        { text: 'Resultados', icon: <BarChartIcon />, path: '/dashboard/resultados', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
        {
            text: 'Relatórios',
            icon: <AssessmentIcon />,
            badge: 'NOVO',
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            children: [
                { text: 'Diário', path: '/dashboard/relatorios/diario', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Semanal', path: '/dashboard/relatorios/semanal', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Mensal', path: '/dashboard/relatorios/mensal', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
            ],
        },
        {
            text: 'Geral',
            icon: <BarChartIcon />,
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            children: [
                { text: 'Satisfação', path: '/dashboard/geral/satisfacao', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Resumo do mês', path: '/dashboard/geral/resumo', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Comparativo de pesquisa', path: '/dashboard/geral/comparativo', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Evolução', path: '/dashboard/geral/evolucao', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Benchmarking', path: '/dashboard/geral/benchmarking', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Nuvem de palavras', path: '/dashboard/geral/nuvem-de-palavras', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
            ],
        },
        {
                        text: 'WhatsApp',
                        icon: <WhatsAppIcon />,
                        badge: 'NOVO',            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN], // Only for tenant admins
            children: [
                { text: 'Conexão', path: '/dashboard/whatsapp-connect', roles: [ROLES.ADMIN] },
                { text: 'Campanhas', path: '/dashboard/cupons/campanhas', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN], badge: 'PRO' },
                { text: 'Automações', path: '/dashboard/whatsapp/automations', roles: [ROLES.ADMIN], badge: 'PRO' },
            ],
        },
        { text: 'Recompensas', icon: <SettingsIcon />, path: '/dashboard/recompensas', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
        { text: 'Reputação', icon: <PeopleIcon />, path: '/dashboard/reputacao', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
        {
            text: 'Cupons', icon: <AssignmentIcon />, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            children: [
                { text: 'Painel', path: '/dashboard/cupons/dashboard', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Gestão de Cupons', path: '/dashboard/cupons', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Validação', path: '/dashboard/validar-cupom', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
            ],
        },
        {
            text: 'Configurações', icon: <SettingsIcon />, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
            children: [
                { text: 'Usuários do Sistema', path: '/dashboard/usuarios', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Perfil', path: '/dashboard/profile', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GERENTE, ROLES.GARCOM] },
                { text: 'Empresa', path: '/dashboard/config', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
                { text: 'Roletas', path: '/dashboard/roletas', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
            ],
        },
    ], [user?.role]);

    const filteredMenuItems = useMemo(() => {
        if (!user?.role?.name) return [];
        return menuItems.filter(item =>
            item.roles.includes(user.role.name) ||
            (item.children && item.children.some(child => child.roles.includes(user.role.name)))
        );
    }, [menuItems, user?.role]);

    useEffect(() => {
        const currentPath = location.pathname;
        const findTitle = (items, path) => {
            for (const item of items) {
                if (item.path === path) {
                    return item.text;
                }
                if (item.children) {
                    const childTitle = findTitle(item.children, path);
                    if (childTitle) {
                        return childTitle;
                    }
                }
            }
            return 'Dashboard';
        };

        const title = findTitle(menuItems, currentPath);
        setPageTitle(title);
    }, [location.pathname, menuItems]);

    const drawer = (
        <div>
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <img src="/logo.png" alt="Logo" style={{ maxHeight: '50px', width: 'auto' }} />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            <List>
                {filteredMenuItems.map((item) => (
                    <React.Fragment key={item.text}>
                        <ListItemButton
                            onClick={() => item.children ? handleSubMenuClick(item.text) : navigate(item.path)}
                            selected={!item.children && location.pathname === item.path}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <Typography variant="body1" component="span">{item.text}</Typography>
                                        {item.badge && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    px: '6px',
                                                    py: '2px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    backgroundColor: 'error.main',
                                                    borderRadius: '8px',
                                                    lineHeight: '1',
                                                }}
                                            >
                                                {item.badge}
                                            </Box>
                                        )}
                                    </Box>
                                }
                                sx={{ opacity: drawerOpen ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }} // Hide text when collapsed
                            />
                            {item.children && (openSubMenu[item.text] ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>
                        {item.children && (
                            <Collapse in={drawerOpen && openSubMenu[item.text]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.children.filter(child => child.roles.includes(user?.role?.name)).map((child) => (
                                        <ListItemButton
                                            key={child.text}
                                            sx={{ pl: 4 }}
                                            onClick={() => navigate(child.path)}
                                            selected={location.pathname === child.path}
                                        >
                                                                                    <ListItemText
                                                                                        primary={
                                                                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                                                                <Typography variant="body2" component="span">{child.text}</Typography>
                                                                                                {child.badge && (
                                                                                                    <Box
                                                                                                        component="span"
                                                                                                        sx={{
                                                                                                            px: '6px',
                                                                                                            py: '2px',
                                                                                                            fontSize: '0.65rem',
                                                                                                            fontWeight: 'bold',
                                                                                                            color: 'white',
                                                                                                            backgroundColor: 'error.main',
                                                                                                            borderRadius: '8px',
                                                                                                            lineHeight: '1',
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                        }}
                                                                                                    >
                                                                                                        {child.badge}
                                                                                                    </Box>
                                                                                                )}
                                                                                            </Box>
                                                                                        }
                                                                                        sx={{ opacity: drawerOpen ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }} // Hide text when collapsed
                                                                                    />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)` },
                    ml: { sm: drawerOpen ? `${drawerWidth}px` : `${collapsedDrawerWidth}px` },
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
                        {/* New IconButton for toggling permanent drawer */}
                        <IconButton
                            color="inherit"
                            aria-label="toggle drawer"
                            edge="start"
                            onClick={handleDrawerOpen}
                            sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }} // Only for desktop
                        >
                            {drawerOpen ? <MenuIcon /> : <MenuIcon />} {/* Can use different icons for open/close */}
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {pageTitle}
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
                            {user?.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt="Profile"
                                    style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 8 }}
                                />
                            ) : (
                                <AccountCircle sx={{ mr: 1 }} />
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography variant="body2" component="span">
                                    {user?.name || 'Usuário'}
                                </Typography>
                                {user?.tenantName && (
                                    <Typography variant="caption" component="span" sx={{ fontSize: '0.75rem' }}>
                                        {user.tenantName}
                                    </Typography>
                                )}
                            </Box>
                        </Button>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleSettings}>Configurações</MenuItem>
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
                    ModalProps={{
                        keepMounted: true,
                    }}
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
                            width: drawerOpen ? drawerWidth : collapsedDrawerWidth,
                            transition: (theme) => theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden', // Hide horizontal scrollbar when collapsed
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
                    width: { sm: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)` },
                    backgroundColor: 'background.default',
                    transition: (theme) => theme.transitions.create('width', { // Change 'margin' to 'width' for transition
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar /> 
                <Outlet /> 
                <SupportSpeedDial />
            </Box>
        </Box>
    );
};

export default DashboardLayout;
