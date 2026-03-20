import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { FaPoll, FaChartLine, FaGift, FaBullhorn, FaTachometerAlt, FaDice } from 'react-icons/fa';
import GlassCard from './GlassCard';

const features = [
  { icon: <FaPoll />, title: 'Pesquisas de Satisfação', description: 'Crie pesquisas personalizadas e descubra o que seus clientes realmente pensam em tempo real.' },
  { icon: <FaChartLine />, title: 'Net Promoter Score (NPS)', description: 'Meça a lealdade dos seus clientes e identifique promotores e detratores da sua marca automaticamente.' },
  { icon: <FaGift />, title: 'Recompensas e Cupons', description: 'Incentive seus clientes a voltarem com um programa de fidelidade atrativo e automatizado.' },
  { icon: <FaBullhorn />, title: 'Campanhas de Marketing', description: 'Envie campanhas via WhatsApp para sua base de clientes, sem pagar por anúncios extras.' },
  { icon: <FaTachometerAlt />, title: 'Dashboard Inteligente', description: 'Acompanhe métricas vitais de retenção, faturamento e satisfação em um só lugar.' },
  { icon: <FaDice />, title: 'Gamificação com Roleta', description: 'Engaje seus clientes com uma experiência divertida e aumente a conversão de feedbacks.' },
];

const FeaturesSection = () => (
  <Box id="solucao" sx={{ py: { xs: 8, md: 15 }, backgroundColor: '#1a2a3a' }}>
    <Container>
      <Box sx={{ textAlign: 'center', mb: 10 }}>
        <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', mb: 3, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
          A Receita Completa para a <Box component="span" sx={{ color: '#FF5722' }}>Recorrência</Box>
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '800px', mx: 'auto' }}>
          Ferramentas poderosas integradas para transformar clientes casuais em fãs apaixonados pelo seu negócio.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <GlassCard sx={{ 
              p: 5, 
              textAlign: 'center', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderBottom: '4px solid transparent',
              '&:hover': {
                borderBottom: '4px solid #FF5722'
              }
            }}>
              <Box sx={{ color: '#FF5722', fontSize: '3.5rem', mb: 3, filter: 'drop-shadow(0 0 10px rgba(255,87,34,0.3))' }}>{feature.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'white' }}>{feature.title}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{feature.description}</Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default FeaturesSection;
