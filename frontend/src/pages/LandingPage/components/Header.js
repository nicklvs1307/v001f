import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Button, Container, Box, IconButton, Drawer, 
  List, ListItem, ListItemButton, ListItemText 
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: 'O Problema', href: '#problema' },
    { text: 'A Solução', href: '#taxas' },
    { text: 'Calculadora', href: '#calculadora' },
    { text: 'Depoimentos', href: '#depoimentos' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250, backgroundColor: '#0D1B2A', height: '100%', color: 'white' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton component="a" href={link.href} sx={{ color: 'white' }}>
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'rgba(13, 27, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between', height: '80px' }}>
          <Box component="a" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Voltaki Logo" style={{ height: '45px' }} />
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navLinks.map(link => (
              <Button 
                key={link.text} 
                color="inherit" 
                href={link.href} 
                sx={{ 
                  fontWeight: 600,
                  '&:hover': { color: '#FF5722', backgroundColor: 'transparent' }
                }}
              >
                {link.text}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Button 
              component={Link} 
              to="/login" 
              variant="contained" 
              sx={{ 
                borderRadius: '50px', 
                fontWeight: 700, 
                px: 4,
                backgroundColor: '#FF5722',
                '&:hover': { backgroundColor: '#e64a19' }
              }}
            >
              Login
            </Button>
          </Box>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={toggleDrawer(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;
