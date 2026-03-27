import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import GlassCard from './GlassCard';

const testimonials = [
  {
    text: 'O Voltaki mudou a forma como nos relacionamos com nossos clientes. A recorrência aumentou 30% em apenas 3 meses!',
    author: 'João Silva',
    role: 'Proprietário de Restaurante',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
  },
  {
    text: 'Finalmente consigo saber o que meus clientes pensam de verdade. O feedback em tempo real é fundamental para nosso crescimento.',
    author: 'Maria Oliveira',
    role: 'Gerente de Negócios',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&q=80'
  },
  {
    text: 'A roleta de prêmios é um sucesso absoluto! Engajamento imediato e os clientes adoram a experiência gamificada.',
    author: 'Carlos Eduardo',
    role: 'Empreendedor Digital',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
  }
];

const TestimonialsSection = () => (
  <Box id="depoimentos" sx={{ py: { xs: 8, md: 15 }, backgroundColor: '#0D1B2A' }}>
    <Container>
      <Box sx={{ textAlign: 'center', mb: 10 }}>
        <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', mb: 3, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
          Quem Usa, <Box component="span" sx={{ color: '#FF5722' }}>Confia</Box>
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '800px', mx: 'auto' }}>
          Veja como estamos ajudando donos de negócios a transformarem seus resultados.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={index}>
            <GlassCard sx={{ 
              p: 5, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              position: 'relative',
              '&::before': {
                content: '"“"',
                position: 'absolute',
                top: 20,
                left: 20,
                fontSize: '8rem',
                color: '#FF5722',
                opacity: 0.1,
                lineHeight: 1
              }
            }}>
              <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 4, flexGrow: 1, color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>
                "{testimonial.text}"
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', gap: 2 }}>
                <Avatar src={testimonial.avatar} sx={{ width: 60, height: 60, border: '2px solid #FF5722' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF5722' }}>{testimonial.author}</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.5)">{testimonial.role}</Typography>
                </Box>
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default TestimonialsSection;
