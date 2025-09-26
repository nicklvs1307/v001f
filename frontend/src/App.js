import React, { useContext, useMemo } from 'react';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import getDynamicTheme from './theme'; // Importar a função getDynamicTheme
import AppRoutes from './routes/AppRoutes'; // Importar o novo componente de rotas

function App() {
  return (
    <AuthProvider>
      <ThemeWrapper>
        <AppRoutes /> {/* Usar o componente AppRoutes */}
      </ThemeWrapper>
    </AuthProvider>
  );
}

function ThemeWrapper({ children }) {
  const { user } = useContext(AuthContext);
  const dynamicTheme = useMemo(() => {
    const primaryColor = user?.primaryColor;
    const secondaryColor = user?.secondaryColor;
    return getDynamicTheme(primaryColor, secondaryColor);
  }, [user?.primaryColor, user?.secondaryColor]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      {children}
    </ThemeProvider>
  );
}

export default App;

