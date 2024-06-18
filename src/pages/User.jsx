import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { Box, useTheme } from '@mui/material';

const User = () => {
  const theme = useTheme();
  const appearance = {
    variables: {
      colorPrimary: theme.palette.primary.main,
      colorBackground: theme.palette.background.default,
      colorText: theme.palette.text.primary,
      colorTextSecondary: theme.palette.text.secondary,
      borderRadius: '12px',
      fontFamily: theme.typography.fontFamily,
    },
    elements: {
      card: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderRadius: '12px',
        boxShadow: theme.shadows[3],
      },
      headerTitle: {
        color: theme.palette.text.primary,
      },
      headerSubtitle: {
        color: theme.palette.text.secondary,
      },
      profileSection: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderRadius: '12px',
      },
      inputField: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderColor: theme.palette.divider,
      },
      button: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    },
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={theme.palette.background.default}>
      <UserProfile appearance={appearance} />
    </Box>
  );
};

export default User;
