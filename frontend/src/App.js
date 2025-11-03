import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Importar o objeto de tema
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <AppRoutes /> {/* Usar o componente AppRoutes */}
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
