import React from 'react';
import { Box, Typography, Button, TextField, Checkbox, FormControlLabel, Link } from '@mui/material';
import { styled } from '@mui/system';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RootBox = styled(Box)(({ theme }) => ({
background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://i.ibb.co/0R7Qz4bP/blurry-dining-tables.jpg) no-repeat center center fixed`,
  backgroundSize: 'cover',
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
  background: 'rgba(255, 255, 255, 0.85)',
  borderRadius: theme.shape.borderRadius * 3,
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
  background: 'transparent',
  color: 'white',
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },}));

const WelcomeContent = styled(Box)({
  zIndex: 1,
  position: 'relative',
});

const LoginSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(6),
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
                width: '150px',
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