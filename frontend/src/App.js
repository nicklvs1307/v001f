import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CustomThemeProvider>
            <NotificationProvider>
              <AppRoutes /> {/* Usar o componente AppRoutes */}
            </NotificationProvider>
          </CustomThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
