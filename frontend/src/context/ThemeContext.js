import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';
import AuthContext from './AuthContext'; // Importar AuthContext

export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const { user } = useContext(AuthContext); // Usar o contexto de autenticação

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // O tema agora é recalculado quando o modo ou o usuário mudam
  const theme = useMemo(() => {
    const themeSettings = {
      mode,
      primaryColor: user?.tenant?.primaryColor,
      secondaryColor: user?.tenant?.secondaryColor,
    };
    return getDynamicTheme(themeSettings);
  }, [mode, user]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
