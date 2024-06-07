import { createTheme } from '@mui/material/styles';

const commonComponents = {
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: 'none',
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007aff', // Apple blue
    },
    secondary: {
      main: '#ff9500', // Apple orange
    },
    background: {
      default: '#f5f5f7', // Light Grey
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Black
      secondary: '#3c3c43', // Dark Grey
    },
    success: {
      main: '#34c759', // Apple green
      light: '#d4f8e8',
    },
    error: {
      main: '#ff3b30', // Apple red
      light: '#ffd9d9',
    },
    warning: {
      main: '#ffcc00', // Apple yellow
      light: '#fff4cc',
    },
    info: {
      main: '#5ac8fa', // Apple cyan
      light: '#d8f5ff',
    },
  },
  components: {
    ...commonComponents,
    MuiPaper: {
      styleOverrides: {
        root: {
          ...commonComponents.MuiPaper.styleOverrides.root,
          backgroundColor: '#ffffff',
          color: '#000000',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#007aff',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0a84ff', // Apple dark blue
    },
    secondary: {
      main: '#ff9f0a', // Apple orange
    },
    background: {
      default: '#1c1c1e', // Dark Grey
      paper: '#2c2c2e', // Mid Grey
    },
    text: {
      primary: '#ffffff', // White
      secondary: '#bdbdbd', // Light Grey
    },
    success: {
      main: '#30d158', // Apple green
      light: '#0c5f17',
    },
    error: {
      main: '#ff453a', // Apple red
      light: '#7c211b',
    },
    warning: {
      main: '#ffd60a', // Apple yellow
      light: '#6e5500',
    },
    info: {
      main: '#64d2ff', // Apple cyan
      light: '#004d71',
    },
  },
  components: {
    ...commonComponents,
    MuiPaper: {
      styleOverrides: {
        root: {
          ...commonComponents.MuiPaper.styleOverrides.root,
          backgroundColor: '#2c2c2e',
          color: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#0a84ff',
        },
      },
    },
  },
});
