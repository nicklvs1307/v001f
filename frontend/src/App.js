import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'; // Adicionar import
import baseTheme from './theme'; // Adicionar import

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
            <NotificationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <MuiThemeProvider theme={baseTheme}> {/* Adicionar MuiThemeProvider aqui */}
                  <AppRoutes />
                </MuiThemeProvider>
              </LocalizationProvider>
            </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
