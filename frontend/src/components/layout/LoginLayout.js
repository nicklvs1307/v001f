import React from 'react';
import { Box, Typography, Button, TextField, Checkbox, FormControlLabel, Link } from '@mui/material';
import { styled } from '@mui/system';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RootBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF8C00 0%, #000000 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: theme.spacing(2),
}));

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '900px',
  height: '550px',
  background: 'white',
  borderRadius: theme.shape.borderRadius * 2.5,
  boxShadow: theme.shadows[5],
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    height: 'auto',
    width: '100%',
    maxWidth: '500px',
  },
}));

const WelcomeSection = styled(Box)(({ theme }) => ({
  flex: 1,
  background: 'linear-gradient(135deg, #FF8C00 0%, #000000 100%)',
  color: 'white',
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    top: '-50px',
    left: '-50px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
    bottom: '-100px',
    right: '-100px',
  },
}));

const WelcomeContent = styled(Box)({
  zIndex: 1,
  position: 'relative',
});

const LoginSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const LoginLayout = ({ children }) => {
  return (
    <RootBox>
      <LoginContainer>
        <WelcomeSection>
          <WelcomeContent>
            <Box
              component="img"
              src={'/logo.png'}
              alt="Logo"
              sx={{
                width: '180px',
                height: 'auto',
                display: 'block',
                margin: '0 auto 20px',
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Bem-vindo de volta!
            </Typography>
            <Typography variant="body1" paragraph sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Estamos felizes em vê-lo novamente. Faça login para acessar sua conta e continuar de onde parou.
            </Typography>
            
            <Box component="ul" sx={{ listStyle: 'none', mt: 3, p: 0 }}>
              <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1, fontSize: '18px' }} />
                <Typography variant="body2">Acesso a todos os recursos</Typography>
              </Box>
              <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1, fontSize: '18px' }} />
                <Typography variant="body2">Dados sincronizados em todos os dispositivos</Typography>
              </Box>
              <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1, fontSize: '18px' }} />
                <Typography variant="body2">Suporte prioritário 24/7</Typography>
              </Box>
            </Box>
          </WelcomeContent>
        </WelcomeSection>
        
        <LoginSection>
          {children}
        </LoginSection>
      </LoginContainer>
    </RootBox>
  );
};

export default LoginLayout;
