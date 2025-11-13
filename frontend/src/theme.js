import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 6, // Reduz o espaçamento base (padrão é 8)
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
    fontSize: 13, // Reduz o tamanho da fonte base
    h1: { fontSize: '2.5rem' },
    h2: { fontSize: '2rem' },
    h3: { fontSize: '1.75rem' },
    h4: { fontSize: '1.5rem' },
    h5: { fontSize: '1.25rem' },
    h6: { fontSize: '1rem' },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem' },
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