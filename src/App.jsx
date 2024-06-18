import React, { useState, useMemo, useEffect } from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Quiz from './pages/Quiz';
import History from './pages/History';
import SignIn from './pages/SignIn';
import Main from './pages/Main';
import Logout from './pages/Logout';
import Navbar from './components/Navbar';
import User from './pages/User';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SpeedInsights />
      
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" />
      </SignedOut>
    </>
  );
};

const App = () => {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SignedIn>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </SignedIn>
      <Routes>
        <Route path="/" element={<Navigate to="/main" />} />
        <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/user" element={<ProtectedRoute><User /></ProtectedRoute>} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
