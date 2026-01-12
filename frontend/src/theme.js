import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 5, // Reduz o espaçamento base (padrão é 8)
  palette: {
    primary: {
      main: '#1B2432',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1EBFAE',
      contrastText: '#FFFFFF',
    },
    gender: {
      masculino: '#2196f3',
      feminino: '#e91e63',
      outro: '#9e9e9e',
      'não informado': '#bdbdbd',
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
    fontSize: 12, // Reduz o tamanho da fonte base
    h1: { fontSize: '2.2rem' },
    h2: { fontSize: '1.8rem' },
    h3: { fontSize: '1.5rem' },
    h4: { fontSize: '1.3rem' },
    h5: { fontSize: '1.1rem' },
    h6: { fontSize: '0.9rem' },
    body1: { fontSize: '0.8rem' },
    body2: { fontSize: '0.7rem' },
    button: { textTransform: 'none' }
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiLoadingButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
        margin: 'dense',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToolbar: {
      styleOverrides: {
        dense: {
          minHeight: 48, // Reduz a altura da toolbar
        }
      }
    }
  },
});

export default theme;