import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import baseTheme from './theme';
import PublicErrorBoundary from './components/common/PublicErrorBoundary';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
            <NotificationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <MuiThemeProvider theme={baseTheme}>
                  <CssBaseline />
                  <PublicErrorBoundary>
                    <AppRoutes />
                  </PublicErrorBoundary>
                </MuiThemeProvider>
              </LocalizationProvider>
            </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
