import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import GlassCard from './GlassCard';
import { FaWhatsapp, FaPaperPlane } from 'react-icons/fa';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const message = `Olá! Gostaria de uma demonstração do Voltaki.%0A%0A*Dados do Lead:*%0A👤 *Nome:* ${formData.nome}%0A📧 *E-mail:* ${formData.email}%0A📱 *Telefone:* ${formData.telefone}`;
    
    const whatsappUrl = `https://wa.me/5535998374007?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Box id="contato" sx={{ py: { xs: 8, md: 15 }, backgroundColor: '#1a2a3a', color: 'white' }}>
      <Container>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
              Pronto para <Box component="span" sx={{ color: '#FF5722' }}>Dominar</Box> seu Mercado?
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, fontWeight: 400 }}>
              Agende uma demonstração de 15 minutos e veja como o Voltaki pode transformar a recorrência do seu negócio.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<FaWhatsapp />}
              href="https://wa.me/5535998374007?text=Olá! Vi a apresentação do Voltaki e gostaria de agendar uma demonstração."
              target="_blank"
              sx={{
                px: 6,
                py: 2,
                borderRadius: '50px',
                fontSize: '1.2rem',
                fontWeight: 800,
                backgroundColor: '#25D366',
                '&:hover': { backgroundColor: '#128C7E', transform: 'translateY(-3px)' },
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(37, 211, 102, 0.3)'
              }}
            >
              Falar pelo WhatsApp
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <GlassCard sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'white' }}>Solicitar Demonstração</Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      required
                      name="nome"
                      label="Seu Nome" 
                      variant="outlined" 
                      value={formData.nome}
                      onChange={handleChange}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
                      sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      required
                      name="email"
                      type="email"
                      label="Seu E-mail" 
                      variant="outlined" 
                      value={formData.email}
                      onChange={handleChange}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
                      sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      required
                      name="telefone"
                      label="Telefone / WhatsApp" 
                      variant="outlined" 
                      value={formData.telefone}
                      onChange={handleChange}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
                      sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      fullWidth 
                      type="submit"
                      variant="contained" 
                      size="large"
                      startIcon={<FaPaperPlane />}
                      sx={{ 
                        borderRadius: '12px', 
                        py: 2, 
                        fontWeight: 800, 
                        fontSize: '1.1rem',
                        backgroundColor: '#FF5722',
                        '&:hover': { backgroundColor: '#e64a19' }
                      }}
                    >
                      Enviar Solicitação
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </GlassCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactSection;
