import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppRoutes /> {/* Usar o componente AppRoutes */}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

