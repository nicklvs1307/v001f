import { createTheme } from '@mui/material/styles';

const getDynamicTheme = ({ mode = 'light', primaryColor = '#FC4C35', secondaryColor = '#1EBFAE' }) => {
  const lightPalette = {
    primary: {
      main: primaryColor,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: secondaryColor,
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#B7E66F',
    },
    error: {
      main: '#E86B42',
    },
    dark: {
      main: '#1B2432',
    },
    background: {
      default: '#F6F7F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2B2B2B',
      secondary: '#64748b',
    },
  };

  const darkPalette = {
    primary: {
      main: primaryColor,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: secondaryColor,
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#B7E66F',
    },
    error: {
      main: '#E86B42',
    },
    dark: {
      main: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A8A8A8',
    },
  };

  return createTheme({
    palette: mode === 'dark' ? darkPalette : lightPalette,
    typography: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1E1E1E' : '#1B2432',
            color: '#FFFFFF',
          },
        },
      },
      MuiButton: {
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
  });
};

export default getDynamicTheme;
