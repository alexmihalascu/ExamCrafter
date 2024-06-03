import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Quiz from '../components/Quiz';

const Home = () => {
  return (
    <div>
      <SignedIn>
        <Quiz />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
};

export default Home;
