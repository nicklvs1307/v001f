import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { NotificationsProvider } from './context/NotificationsContext';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <SnackbarProvider>
              <CustomThemeProvider>
                <AppRoutes /> {/* Usar o componente AppRoutes */}
              </CustomThemeProvider>
            </SnackbarProvider>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
