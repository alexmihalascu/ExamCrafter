import { createTheme } from '@mui/material/styles';

// Custom shadows for depth
const shadows = [
  'none',
  '0px 2px 8px rgba(0, 0, 0, 0.1)',
  '0px 4px 16px rgba(0, 0, 0, 0.12)',
  '0px 8px 24px rgba(0, 0, 0, 0.14)',
  '0px 12px 32px rgba(0, 0, 0, 0.16)',
  '0px 16px 40px rgba(0, 0, 0, 0.18)',
  ...Array(19).fill('none'),
];

// Typography configuration
const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
  h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
  button: { textTransform: 'none', fontWeight: 500 }
};

// Common component styles
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
        padding: '8px 16px',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: shadows[1],
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: 12,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backdropFilter: 'blur(8px)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A84FF',
      light: '#6CB8FF',
      dark: '#0058CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF9F0A',
      light: '#FFCC66',
      dark: '#CC7D00',
      contrastText: '#000000',
    },
    background: {
      default: '#F2F2F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    success: {
      main: '#32D74B',
      light: '#86E69D',
      dark: '#248A32',
    },
    error: {
      main: '#FF453A',
      light: '#FF8A84',
      dark: '#CC1810',
    },
    warning: {
      main: '#FFD60A',
      light: '#FFE566',
      dark: '#CC9C00',
    },
    info: {
      main: '#64D2FF',
      light: '#A6E5FF',
      dark: '#0091CC',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography,
  components,
  shadows,
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A84FF',
      light: '#5AC8FA',
      dark: '#0058CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF9F0A',
      light: '#FFB340',
      dark: '#CC7D00',
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#1C1C1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#98989D',
    },
    success: {
      main: '#32D74B',
      light: '#4CD964',
      dark: '#248A32',
    },
    error: {
      main: '#FF453A',
      light: '#FF6961',
      dark: '#CC1810',
    },
    warning: {
      main: '#FFD60A',
      light: '#FFE33B',
      dark: '#CC9C00',
    },
    info: {
      main: '#64D2FF',
      light: '#91E4FF',
      dark: '#0091CC',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography,
  components: {
    ...components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          backgroundColor: '#1C1C1E',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          backgroundColor: '#1C1C1E',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
  shadows: shadows.map(shadow => 
    shadow === 'none' ? shadow : shadow.replace('rgba(0, 0, 0,', 'rgba(0, 0, 0,')),
});