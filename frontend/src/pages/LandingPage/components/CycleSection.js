import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { FaBullhorn, FaMobileAlt, FaStore, FaArrowRight, FaSync } from 'react-icons/fa';
import GlassCard from './GlassCard';

const steps = [
  {
    icon: <FaBullhorn />,
    title: "1. Você Paga para Anunciar",
    description: "Você investe em tráfego pago para alcançar clientes, sejam eles novos ou antigos.",
    align: 'left'
  },
  {
    icon: <FaMobileAlt />,
    title: "2. O Cliente vai para o App",
    description: "Ele é direcionado para a plataforma, onde você paga até 26% de taxa e os dados não são seus.",
    align: 'right'
  },
  {
    icon: <FaStore />,
    title: "3. A Conveniência Vence",
    description: "Na próxima vez, o cliente abre o app por hábito e é bombardeado por seus concorrentes.",
    align: 'left'
  },
  {
    icon: <FaSync />,
    title: "4. Você Paga de Novo",
    description: "O ciclo recomeça. Você paga novamente para tentar alcançar o mesmo cliente que já comprou de você.",
    align: 'right'
  }
];

const CycleSection = () => {
  return (
    <Box
      id="ciclo"
      sx={{
        py: { xs: 8, md: 15 },
        backgroundColor: '#1a2a3a',
        position: 'relative',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', md: '3.8rem' },
              mb: 3,
              lineHeight: 1.1
            }}
          >
            O Ciclo Vicioso do <Box component="span" sx={{ color: '#FF5722', textShadow: '0 0 15px rgba(255, 87, 34, 0.4)' }}>Cliente Alugado</Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '800px', mx: 'auto', fontWeight: 400 }}>
            Por que você continua pagando várias vezes pela mesma pessoa? É hora de parar de alugar e começar a possuir.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', mt: 8 }}>
          {/* Vertical Connector Line (Desktop) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(to bottom, #FF5722 0%, rgba(255, 87, 34, 0.1) 100%)',
              borderRadius: '2px',
              zIndex: 0,
              transform: 'translateX(-50%)',
            }}
          />

          {steps.map((step, index) => (
            <Grid container spacing={4} key={index} alignItems="center" sx={{ mb: { xs: 4, md: 10 }, position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: step.align === 'left' ? 1 : 3 } }}>
                {step.align === 'left' ? (
                  <GlassCard sx={{ p: 4, textAlign: { xs: 'center', md: 'right' }, borderRight: { md: '4px solid #FF5722' } }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#FF5722' }}>{step.title}</Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>{step.description}</Typography>
                  </GlassCard>
                ) : <Box sx={{ display: { xs: 'none', md: 'block' } }} />}
              </Grid>

              <Grid item xs={12} md={2} sx={{ order: { xs: 1, md: 2 }, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#1a2a3a',
                    border: '4px solid #FF5722',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#FF5722',
                    boxShadow: '0 0 30px rgba(255, 87, 34, 0.4)',
                    zIndex: 2,
                    position: 'relative',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                >
                  {step.icon}
                </Box>
              </Grid>

              <Grid item xs={12} md={5} sx={{ order: { xs: 3, md: step.align === 'right' ? 3 : 1 } }}>
                {step.align === 'right' ? (
                  <GlassCard sx={{ p: 4, textAlign: { xs: 'center', md: 'left' }, borderLeft: { md: '4px solid #FF5722' } }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#FF5722' }}>{step.title}</Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>{step.description}</Typography>
                  </GlassCard>
                ) : <Box sx={{ display: { xs: 'none', md: 'block' } }} />}
              </Grid>
            </Grid>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <GlassCard sx={{ 
            p: 6, 
            display: 'inline-block', 
            border: '2px solid #FF5722',
            maxWidth: '800px',
            backgroundColor: 'rgba(255, 87, 34, 0.05)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, lineHeight: 1.3 }}>
              Chega de pagar aluguel por quem já é seu.<br/>
              <Box component="span" sx={{ color: '#FF5722' }}>É hora de construir seu próprio ativo.</Box>
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              href="#calculadora"
              sx={{ 
                borderRadius: '50px', 
                px: 6, 
                py: 2, 
                fontSize: '1.2rem', 
                fontWeight: 800,
                backgroundColor: '#FF5722',
                boxShadow: '0 10px 30px rgba(255, 87, 34, 0.3)',
                '&:hover': { backgroundColor: '#e64a19' }
              }}
            >
              Quero Quebrar o Ciclo
            </Button>
          </GlassCard>
        </Box>
      </Container>
    </Box>
  );
};

export default CycleSection;

