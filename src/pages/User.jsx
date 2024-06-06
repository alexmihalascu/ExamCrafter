import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { Box } from '@mui/material';

const User = () => {
  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <UserProfile />
      </Box>
    </>
  );
};

export default User;
