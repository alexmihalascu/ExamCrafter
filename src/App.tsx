import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar';
import { lightTheme, darkTheme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Route-level code splitting keeps the initial bundle lean.
const Main = lazy(() => import('./pages/Main'));
const Quiz = lazy(() => import('./pages/Quiz'));
const History = lazy(() => import('./pages/History'));
const QuestionSets = lazy(() => import('./pages/QuestionSets'));
const User = lazy(() => import('./pages/User'));
const SignIn = lazy(() => import('./pages/SignIn'));
const Logout = lazy(() => import('./pages/Logout'));

const RouteFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50dvh' }}>
    <CircularProgress size={28} thickness={4} />
  </Box>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/sign-in" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/main" replace />;
  return children;
};

const AppContent = () => {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('darkMode', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SpeedInsights />
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        {currentUser && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/main" replace />} />
              <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/sets" element={<ProtectedRoute><QuestionSets /></ProtectedRoute>} />
              <Route path="/admin/*" element={<Navigate to="/sets" replace />} />
              <Route path="/user" element={<ProtectedRoute><User /></ProtectedRoute>} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
