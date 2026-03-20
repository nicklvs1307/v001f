import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';

const phrases = [
  "Aumente sua recorrência e faturamento.",
  "Crie sua própria comunidade.",
  "Economize com taxas de aplicativos.",
  "Saiba em tempo real se o seu cliente está satisfeito.",
  "Automatize seu marketing de retenção."
];

const HeroSection = () => {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting && letterIndex < currentPhrase.length) {
        setText(currentPhrase.substring(0, letterIndex + 1));
        setLetterIndex(letterIndex + 1);
      } else if (isDeleting && letterIndex > 0) {
        setText(currentPhrase.substring(0, letterIndex - 1));
        setLetterIndex(letterIndex - 1);
      } else if (!isDeleting && letterIndex === currentPhrase.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && letterIndex === 0) {
        setIsDeleting(false);
        setPhraseIndex((phraseIndex + 1) % phrases.length);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [letterIndex, isDeleting, phraseIndex]);

  return (
    <Box
      id="hero"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#0D1B2A',
        overflow: 'hidden',
        color: 'white',
        pt: { xs: 8, md: 0 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.5,
          zIndex: 0
        }
      }}
    >
      {/* Glow Effects */}
      <Box sx={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255, 87, 34, 0.15) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
            fontWeight: 900,
            lineHeight: 1.2,
            mb: 4,
            minHeight: { xs: '180px', md: '160px' },
            textShadow: '0 0 20px rgba(255, 87, 34, 0.3)',
          }}
        >
          {text}
          <Box component="span" sx={{ 
            display: 'inline-block',
            width: '4px',
            height: { xs: '40px', md: '60px' },
            backgroundColor: '#FF5722',
            ml: 1,
            verticalAlign: 'middle',
            animation: 'blink 1s infinite'
          }} />
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '1rem', md: '1.4rem' },
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '800px',
            mx: 'auto',
            mb: 6,
            fontWeight: 400
          }}
        >
          A solução definitiva para negócios que querem parar de alugar clientes e começar a construir um ativo próprio.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            href="#calculadora"
            sx={{
              px: 5,
              py: 2,
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: 800,
              backgroundColor: '#FF5722',
              boxShadow: '0 0 30px rgba(255, 87, 34, 0.4)',
              '&:hover': {
                backgroundColor: '#e64a19',
                transform: 'translateY(-3px)',
                boxShadow: '0 0 40px rgba(255, 87, 34, 0.6)',
              },
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            QUERO AUMENTAR MINHA RECORRÊNCIA
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            href="#solucao"
            sx={{
              px: 5,
              py: 2,
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.05)',
                transform: 'translateY(-3px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            VER SOLUÇÕES
          </Button>
        </Box>
      </Container>

      {/* Wave Divider */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: '100%',
          lineHeight: 0,
          zIndex: 2,
          '& svg': {
            display: 'block',
            width: 'calc(100% + 1.3px)',
            height: '100px',
          },
          '& path': {
            fill: '#1a2a3a',
          }
        }}
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </Box>

      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
};

export default HeroSection;

