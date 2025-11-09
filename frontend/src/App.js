import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CustomThemeProvider>
            <NotificationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AppRoutes /> {/* Usar o componente AppRoutes */}
              </LocalizationProvider>
            </NotificationProvider>
          </CustomThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
