import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomThemeProvider>
          <AppRoutes /> {/* Usar o componente AppRoutes */}
        </CustomThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
