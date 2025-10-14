import React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Um tema básico para páginas públicas, pode ser estendido ou substituído por um tema dinâmico
const defaultPublicTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

const PublicLayout = ({ children }) => {
  return (
    <ThemeProvider theme={defaultPublicTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default PublicLayout;
