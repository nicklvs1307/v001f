import React from 'react';
import { Box, Container, Grid, Typography, IconButton, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

const Footer = () => (
  <Box sx={{ backgroundColor: '#0D1B2A', color: 'white', py: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
    <Container>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <img src="/logo.png" alt="Voltaki Logo" style={{ height: '45px', marginBottom: '25px' }} />
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            A solução premium para negócios que desejam transformar clientes casuais em fãs recorrentes e aumentar seu faturamento de forma previsível.
          </Typography>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'white' }}>Navegação</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button component="a" href="#problema" sx={{ p: 0, justifyContent: 'flex-start', color: 'rgba(255,255,255,0.6)', textTransform: 'none', '&:hover': { color: '#FF5722' } }}>O Problema</Button>
            <Button component="a" href="#taxas" sx={{ p: 0, justifyContent: 'flex-start', color: 'rgba(255,255,255,0.6)', textTransform: 'none', '&:hover': { color: '#FF5722' } }}>Sócio Oculto</Button>
            <Button component="a" href="#calculadora" sx={{ p: 0, justifyContent: 'flex-start', color: 'rgba(255,255,255,0.6)', textTransform: 'none', '&:hover': { color: '#FF5722' } }}>Calculadora</Button>
            <Button component="a" href="#solucao" sx={{ p: 0, justifyContent: 'flex-start', color: 'rgba(255,255,255,0.6)', textTransform: 'none', '&:hover': { color: '#FF5722' } }}>Funcionalidades</Button>
          </Box>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'white' }}>Legal</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button component={Link} to="/termos-de-servico" sx={{ p: 0, justifyContent: 'flex-start', color: 'rgba(255,255,255,0.6)', textTransform: 'none', '&:hover': { color: '#FF5722' } }}>Termos de Uso</Button>
            <Button component={Link} to="/politica-de-privacidade" sx={{ p: 0, justifyContent: 'flex-start', color: 'rgba(255,255,255,0.6)', textTransform: 'none', '&:hover': { color: '#FF5722' } }}>Privacidade</Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'white' }}>Social</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton href="#" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { backgroundColor: '#FF5722', borderColor: '#FF5722' } }}><FaFacebookF /></IconButton>
            <IconButton href="#" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { backgroundColor: '#FF5722', borderColor: '#FF5722' } }}><FaInstagram /></IconButton>
            <IconButton href="#" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { backgroundColor: '#FF5722', borderColor: '#FF5722' } }}><FaLinkedinIn /></IconButton>
            <IconButton href="https://wa.me/5535998374007" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { backgroundColor: '#25D366', borderColor: '#25D366' } }}><FaWhatsapp /></IconButton>
          </Box>
          <Typography variant="body2" sx={{ mt: 4, color: 'rgba(255,255,255,0.4)' }}>
            &copy; {new Date().getFullYear()} Voltaki. Todos os direitos reservados.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default Footer;
