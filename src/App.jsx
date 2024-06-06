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

const ProtectedRoute = () => {
  return (
    <>
      <SpeedInsights />
      
      <SignedIn>
        <Outlet />
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
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Routes>
        <Route path="/" element={<Navigate to="/main" />} />
        <Route path="/main" element={<ProtectedRoute />}>
          <Route path="" element={<Main />} />
        </Route>
        <Route path="/history" element={<ProtectedRoute />}>
          <Route path="" element={<History />} />
        </Route>
        <Route path="/quiz" element={<ProtectedRoute />}>
          <Route path="" element={<Quiz />} />
        </Route>
        <Route path="/user" element={<ProtectedRoute />}>
          <Route path="" element={<User />} />
        </Route>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/logout" element={<Logout />} /> {/* Use Logout component */}
      </Routes>
    </ThemeProvider>
  );
};

export default App;
