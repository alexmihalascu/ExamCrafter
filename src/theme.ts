import { alpha, createTheme } from '@mui/material/styles';

// ---------------------------------------------------------------------------
// ExamCrafter - editorial, single-accent design system.
// One considered indigo accent over warm-neutral surfaces. No gradients,
// no glassmorphism, hairline dividers, tabular figures for data.
// ---------------------------------------------------------------------------

const display = "'Space Grotesk', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const body = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const mono = "'Geist Mono', 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

const typography = {
  fontFamily: body,
  h1: { fontFamily: display, fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05 },
  h2: { fontFamily: display, fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1 },
  h3: { fontFamily: display, fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 },
  h4: { fontFamily: display, fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.015em' },
  h5: { fontWeight: 600, fontSize: '1.15rem', letterSpacing: '-0.01em' },
  h6: { fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.005em' },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 500, letterSpacing: '0.01em' },
  body1: { lineHeight: 1.6 },
  body2: { lineHeight: 1.6 },
  overline: { fontWeight: 600, letterSpacing: '0.16em', fontSize: '0.7rem' },
  button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0' },
};

const palettes = {
  light: {
    mode: 'light',
    primary: { main: '#5560E0', light: '#8088EE', dark: '#3F49C9', contrastText: '#FFFFFF' },
    secondary: { main: '#44464F', light: '#6E707A', dark: '#2C2E36', contrastText: '#FFFFFF' },
    background: { default: '#FAFAF7', paper: '#FFFFFF' },
    text: { primary: '#18181B', secondary: '#62636E', disabled: '#9A9BA4' },
    divider: 'rgba(20,20,28,0.08)',
    success: { main: '#1F9D6B', contrastText: '#FFFFFF' },
    error: { main: '#D6453D', contrastText: '#FFFFFF' },
    warning: { main: '#C2870F', contrastText: '#FFFFFF' },
    info: { main: '#3F49C9', contrastText: '#FFFFFF' },
    grey: { 100: '#F3F3EF', 200: '#E8E8E2' },
  },
  dark: {
    mode: 'dark',
    primary: { main: '#8088EE', light: '#A6ACF4', dark: '#5560E0', contrastText: '#0E0F13' },
    secondary: { main: '#A8AAB6', light: '#C6C7CF', dark: '#7A7C88', contrastText: '#0E0F13' },
    background: { default: '#14151A', paper: '#1B1C22' },
    text: { primary: '#ECECEF', secondary: '#9A9BA6', disabled: '#62636C' },
    divider: 'rgba(255,255,255,0.09)',
    success: { main: '#35C490', contrastText: '#0E0F13' },
    error: { main: '#F0746B', contrastText: '#0E0F13' },
    warning: { main: '#E0A93C', contrastText: '#0E0F13' },
    info: { main: '#8088EE', contrastText: '#0E0F13' },
    grey: { 100: '#23242B', 200: '#2C2D35' },
  },
};

// Soft, tinted shadow scale (cool ink rather than pure black).
const makeShadows = (mode) => {
  const c = mode === 'light' ? '23, 24, 33' : '0, 0, 0';
  const s = (y, b, a) => `0px ${y}px ${b}px rgba(${c}, ${a})`;
  return [
    'none',
    s(1, 2, mode === 'light' ? 0.04 : 0.3),
    s(2, 6, mode === 'light' ? 0.05 : 0.34),
    s(4, 12, mode === 'light' ? 0.06 : 0.38),
    s(8, 24, mode === 'light' ? 0.08 : 0.44),
    s(14, 36, mode === 'light' ? 0.1 : 0.5),
    ...Array(19).fill(s(18, 48, mode === 'light' ? 0.12 : 0.55)),
  ];
};

const buildComponents = (mode) => {
  const isLight = mode === 'light';
  const p = palettes[mode];
  const focusRing = `0 0 0 3px ${alpha(p.primary.main, isLight ? 0.28 : 0.4)}`;

  return {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': { colorScheme: mode },
        body: { fontFeatureSettings: '"cv11", "ss01"' },
        '*:focus-visible': { outline: 'none', boxShadow: focusRing, borderRadius: 6 },
        '::selection': { background: alpha(p.primary.main, 0.22) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '9px 20px',
          transition: 'background-color .18s ease, transform .12s ease, border-color .18s ease, box-shadow .18s ease',
          '&:active': { transform: 'scale(0.98)' },
          '&:focus-visible': { boxShadow: focusRing },
        },
        sizeLarge: { padding: '12px 28px', fontSize: '1rem' },
        contained: {
          backgroundColor: p.primary.main,
          color: p.primary.contrastText,
          boxShadow: `0 1px 2px ${alpha(p.primary.dark, 0.3)}`,
          '&:hover': { backgroundColor: p.primary.dark },
        },
        outlined: {
          borderColor: p.divider,
          color: p.text.primary,
          '&:hover': { borderColor: p.primary.main, backgroundColor: alpha(p.primary.main, 0.06) },
        },
        text: {
          color: p.text.primary,
          '&:hover': { backgroundColor: alpha(p.primary.main, 0.08) },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: `1px solid ${p.divider}`,
        },
        outlined: { border: `1px solid ${p.divider}` },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: `1px solid ${p.divider}`,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: {
          backgroundColor: isLight ? alpha('#FFFFFF', 0.8) : alpha('#14151A', 0.8),
          backdropFilter: 'blur(12px)',
          color: p.text.primary,
          borderBottom: `1px solid ${p.divider}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        outlined: { borderColor: p.divider },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: isLight ? p.grey[100] : p.grey[100],
          '& fieldset': { borderColor: p.divider },
          '&:hover fieldset': { borderColor: alpha(p.text.primary, 0.24) },
          '&.Mui-focused fieldset': { borderColor: p.primary.main, borderWidth: 1 },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, height: 8, backgroundColor: p.grey[200] },
        bar: { borderRadius: 999 },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: isLight ? '#18181B' : '#2C2D35', borderRadius: 8, fontSize: '0.75rem' },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 18 } },
    },
  };
};

const buildTheme = (mode) =>
  createTheme({
    palette: palettes[mode],
    typography,
    shape: { borderRadius: 12 },
    shadows: makeShadows(mode),
    components: buildComponents(mode),
    custom: { mono },
  });

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
