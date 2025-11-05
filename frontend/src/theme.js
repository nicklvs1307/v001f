import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FC4C35',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1EBFAE',
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
    
  },
});

export default theme;