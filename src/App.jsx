import React from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Quiz from './pages/Quiz';
import History from './pages/History';
import SignIn from './pages/SignIn';
import Main from './pages/Main';
import Logout from './pages/Logout';
import Navbar from './components/Navbar';
import { SpeedInsights } from "@vercel/speed-insights/react"

const ProtectedRoute = () => {
  return (
    <>
    <SpeedInsights/>
      <Navbar />
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
  return (
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
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/logout" element={<Logout />} /> {/* Use Logout component */}
    </Routes>
  );
};

export default App;
