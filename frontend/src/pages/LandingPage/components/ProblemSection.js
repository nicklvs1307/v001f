import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { FaUserTimes, FaPercentage, FaSearch, FaGamepad } from 'react-icons/fa';
import GlassCard from './GlassCard';

const points = [
  {
    icon: <FaUserTimes />,
    text: "Concorrência acirrada e clientes cada vez mais exigentes em todos os canais.",
    color: "#FF8C00"
  },
  {
    icon: <FaPercentage />,
    text: "Altas taxas de intermediários e plataformas que corroem sua margem de lucro real.",
    color: "#E76F51"
  },
  {
    icon: <FaSearch />,
    text: "Dificuldade de saber quem é o seu cliente recorrente e como falar com ele.",
    color: "#4A90E2"
  },
  {
    icon: <FaGamepad />,
    text: "Estratégias de fidelidade genéricas que não engajam e não trazem retorno mensurável.",
    color: "#2A9D8F"
  }
];

const ProblemSection = () => {
  return (
    <Box
      id="problema"
      sx={{
        py: { xs: 8, md: 15 },
        backgroundColor: '#1a2a3a',
        position: 'relative',
        color: 'white',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', md: '3.8rem' },
              mb: 3,
              lineHeight: 1.1
            }}
          >
            O Dilema do <Box component="span" sx={{ color: '#FF5722', textShadow: '0 0 15px rgba(255, 87, 34, 0.4)' }}>Dono de Negócio</Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '800px', mx: 'auto', fontWeight: 400 }}>
            Na guerra pela atenção, o cliente fiel é o seu maior trunfo. Mas hoje, você está focado em construir o seu negócio ou o dos outros?
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {points.map((point, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <GlassCard
                sx={{
                  p: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                  border: '1px solid rgba(255,255,255,0.05)',
                  '&:hover': {
                    borderColor: point.color,
                    boxShadow: `0 15px 40px -10px ${point.color}33`
                  }
                }}
              >
                <Box sx={{ 
                  fontSize: '4rem', 
                  color: point.color, 
                  mb: 3,
                  filter: `drop-shadow(0 0 10px ${point.color}44)`
                }}>
                  {point.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.4, color: 'white' }}>
                  {point.text}
                </Typography>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProblemSection;

