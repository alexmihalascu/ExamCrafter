import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

const Logout = () => {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const performSignOut = async () => {
      await signOut();
      navigate('/sign-in');
    };
    performSignOut();
  }, [signOut, navigate]);

  return null;
};

export default Logout;
