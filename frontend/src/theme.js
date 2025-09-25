import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4e73df', // --primary
    },
    secondary: {
      main: '#6f42c1', // --secondary
    },
    success: {
      main: '#1cc88a', // --success
    },
    info: {
      main: '#36b9cc', // --info
    },
    warning: {
      main: '#f6c23e', // --warning
    },
    danger: {
      main: '#e74a3b', // --danger
    },
    light: {
      main: '#f8f9fc', // --light
    },
    dark: {
      main: '#5a5c69', // --dark
    },
    background: {
      default: '#f8f9fc', // body background
    },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          color: '#5a5c69', // Cor do texto do header
          borderBottom: '1px solid #e3e6f0',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #4e73df 0%, #6f42c1 100%)',
          color: 'white',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.7)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-selected': {
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit', // Garante que o ícone herde a cor do ListItemButton
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { className: 'btn-checkin' },
          style: {
            background: 'linear-gradient(45deg, #4e73df, #6f42c1)',
            color: 'white',
            fontWeight: 'bold',
            padding: '15px 30px',
            borderRadius: '50px',
            border: 'none',
            fontSize: '1.2rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #4e73df, #6f42c1)', // Manter o gradiente no hover
              opacity: 0.9,
            },
          },
        },
      ],
    },
  },
});

export default theme;
