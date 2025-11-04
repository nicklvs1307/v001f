import { createTheme } from '@mui/material/styles';

const getDynamicTheme = (primaryColor, secondaryColor) => {
  return createTheme({
    palette: {
      primary: {
        main: primaryColor || '#FC4C35',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: secondaryColor || '#1EBFAE',
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
    },
    typography: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1B2432',
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
            background: '#1B2432',
            color: 'white',
          },
        },
      },
    },
  });
};

export default getDynamicTheme;
