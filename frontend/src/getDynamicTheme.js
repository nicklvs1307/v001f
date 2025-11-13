import { createTheme } from '@mui/material/styles';
import baseTheme from './theme'; // Import the base theme

const getDynamicTheme = ({ mode = 'light', primaryColor = '#FC4C35', secondaryColor = '#1EBFAE' }) => {
  const dynamicPalette = {
    primary: {
      main: primaryColor,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: secondaryColor,
      contrastText: '#FFFFFF',
    },
  };

  const themeOverrides = {
    palette: {
      ...baseTheme.palette,
      ...dynamicPalette,
      mode: mode,
      ...(mode === 'dark' && {
        background: {
          default: '#121212',
          paper: '#1E1E1E',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A8A8A8',
        },
      }),
    },
    components: {
      ...baseTheme.components,
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1E1E1E' : '#1B2432',
            color: '#FFFFFF',
          },
        },
      },
      MuiButton: {
        ...baseTheme.components.MuiButton,
        styleOverrides: {
          root: {
            borderRadius: '50px',
            textTransform: 'none',
            fontWeight: 700,
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#E6452F',
            },
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: '#17A396',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === 'dark' ? '#1E1E1E' : '#1B2432',
            color: 'white',
          },
        },
      },
    },
  };

  return createTheme(baseTheme, themeOverrides);
};

export default getDynamicTheme;

