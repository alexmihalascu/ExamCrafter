import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { Box, CircularProgress, Typography } from '@mui/material';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await logout();
        navigate('/sign-in');
      } catch (error) {
        console.error('Error signing out:', error);
        navigate('/sign-in');
      }
    };
    performSignOut();
  }, [logout, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70dvh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1">Se deconectează...</Typography>
    </Box>
  );
};

export default Logout;
