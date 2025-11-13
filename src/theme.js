import { alpha, createTheme } from '@mui/material/styles';

const baseShadows = [
  'none',
  '0px 15px 45px rgba(8, 10, 35, 0.08)',
  '0px 25px 65px rgba(8, 10, 35, 0.12)',
  ...Array(22).fill('none'),
];

const typography = {
  fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  h1: { fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em' },
  h2: { fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.02em' },
  h3: { fontSize: '1.9rem', fontWeight: 600 },
  h4: { fontSize: '1.5rem', fontWeight: 600 },
  h5: { fontSize: '1.25rem', fontWeight: 600 },
  h6: { fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' },
  button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.04em' },
};

const getGlassSurface = (mode) => ({
  backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(18, 21, 40, 0.75)',
  border: `1px solid ${mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)'}`,
  backdropFilter: 'blur(28px) saturate(180%)',
  boxShadow: mode === 'light'
    ? '0 35px 70px rgba(9, 12, 32, 0.12)'
    : '0 40px 80px rgba(0, 0, 0, 0.45)',
});

const buildComponents = (mode) => {
  const glass = getGlassSurface(mode);
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '10px 28px',
        },
        contained: {
          background: mode === 'light'
            ? 'linear-gradient(120deg, #4F5BFF, #8C4EFF)'
            : 'linear-gradient(120deg, #6E76FF, #A557FF)',
          color: '#fff',
          boxShadow: '0 20px 30px rgba(78, 109, 255, 0.25)',
        },
        outlined: {
          borderColor: alpha('#FFFFFF', 0.3),
          color: '#fff',
          backgroundColor: alpha('#FFFFFF', 0.06),
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 24, ...glass } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 24, ...glass } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 12, 25, 0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: alpha('#FFFFFF', mode === 'light' ? 0.35 : 0.05),
            backdropFilter: 'blur(18px)',
          },
          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        },
      },
    },
  };
};

const lightPalette = {
  mode: 'light',
  primary: {
    main: '#4D5BFF',
    light: '#8BA1FF',
    dark: '#3A3FD8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF82C3',
    light: '#FFC6E8',
    dark: '#D85298',
    contrastText: '#0B0F19',
  },
  background: {
    default: '#EBEEF9',
    paper: 'rgba(255,255,255,0.75)',
  },
  text: {
    primary: '#0B0F19',
    secondary: '#3E4A76',
  },
  success: { main: '#3FE0B0' },
  error: { main: '#FF6B6B' },
  warning: { main: '#FFD166' },
  info: { main: '#6AD7FF' },
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#8C9EFF',
    light: '#B6C5FF',
    dark: '#5C6BC0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF9ACD',
    light: '#FFC4E3',
    dark: '#C76A9C',
    contrastText: '#080B16',
  },
  background: {
    default: '#050915',
    paper: 'rgba(10,12,25,0.8)',
  },
  text: {
    primary: '#F8FAFF',
    secondary: '#9FA8D4',
  },
  success: { main: '#3EE7B0' },
  error: { main: '#FF7B8F' },
  warning: { main: '#FFD95E' },
  info: { main: '#6AD7FF' },
};

export const lightTheme = createTheme({
  palette: lightPalette,
  typography,
  shape: { borderRadius: 22 },
  shadows: baseShadows,
  components: buildComponents('light'),
});

export const darkTheme = createTheme({
  palette: darkPalette,
  typography,
  shape: { borderRadius: 22 },
  shadows: baseShadows,
  components: buildComponents('dark'),
});
