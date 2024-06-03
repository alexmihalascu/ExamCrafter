import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Box } from '@mui/material';


const SignIn = () => {
  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <ClerkSignIn />
      </Box>
    </>
  );
};

export default SignIn;
