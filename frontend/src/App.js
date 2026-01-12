import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
            <NotificationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <AppRoutes /> {/* Usar o componente AppRoutes */}
              </LocalizationProvider>
            </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
