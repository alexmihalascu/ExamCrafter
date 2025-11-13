import React, { useState, useMemo, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Quiz from './pages/Quiz';
import History from './pages/History';
import SignIn from './pages/SignIn';
import Main from './pages/Main';
import Logout from './pages/Logout';
import Navbar from './components/Navbar';
import User from './pages/User';
import QuestionSets from './pages/QuestionSets';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/main" />;
  }

  return (
    <>
      <SpeedInsights />
      {children}
    </>
  );
};

const AppContent = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    if (location.pathname.toLowerCase().startsWith('/admin')) {
      navigate('/sets', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(4,6,14,0.96), rgba(5,9,18,0.92))'
            : 'linear-gradient(180deg, rgba(239,244,255,0.92), rgba(226,235,255,0.92))',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              width: '45vw',
              height: '45vw',
              borderRadius: '50%',
              filter: 'blur(80px)',
              opacity: 0.55,
            },
            '&::before': {
              top: '-20%',
              left: '-10%',
              background: 'radial-gradient(circle, rgba(92,132,255,0.5), transparent 70%)',
            },
            '&::after': {
              bottom: '-10%',
              right: '-5%',
              background: 'radial-gradient(circle, rgba(73,210,255,0.45), transparent 65%)',
            },
          }}
        />

        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh', zIndex: 1 }}>
          {currentUser && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
          <Box sx={{ flexGrow: 1, px: { xs: 2, md: 4 }, py: { xs: 8, md: 6 } }}>
          <Routes>
            <Route path="/" element={<Navigate to="/main" />} />
            <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/sets" element={<ProtectedRoute><QuestionSets /></ProtectedRoute>} />
            <Route path="/admin" element={<Navigate to="/sets" replace />} />
            <Route path="/admin/*" element={<Navigate to="/sets" replace />} />
            <Route path="/user" element={<ProtectedRoute><User /></ProtectedRoute>} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/main" replace />} />
          </Routes>
        </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
