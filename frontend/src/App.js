import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  return (
    <Router>
      <AuthProvider>
            <CustomThemeProvider>
              <NotificationProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <AppRoutes /> {/* Usar o componente AppRoutes */}
                </LocalizationProvider>
              </NotificationProvider>
            </CustomThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
