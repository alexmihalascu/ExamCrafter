import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserDocument = async (user) => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const baseProfile = {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      updatedAt: new Date().toISOString(),
    };

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        ...baseProfile,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      setUserRole('user');
    } else {
      const userData = userDoc.data();
      setUserRole(userData.role || 'user');
      await setDoc(userDocRef, baseProfile, { merge: true });
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    await syncUserDocument(userCredential.user);

    return userCredential;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  const updateUserProfile = async ({ displayName, photoURL }) => {
    if (!auth.currentUser) return;

    const profileUpdates = {};
    if (typeof displayName === 'string') {
      profileUpdates.displayName = displayName.trim();
    }
    if (typeof photoURL === 'string') {
      profileUpdates.photoURL = photoURL;
    }

    if (!Object.keys(profileUpdates).length) {
      return;
    }

    await updateProfile(auth.currentUser, profileUpdates);
    await auth.currentUser.reload();

    await setDoc(
      doc(db, 'users', auth.currentUser.uid),
      {
        ...(profileUpdates.displayName !== undefined && {
          displayName: auth.currentUser.displayName,
        }),
        ...(profileUpdates.photoURL !== undefined && {
          photoURL: auth.currentUser.photoURL,
        }),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    setCurrentUser({ ...auth.currentUser });
  };

  // Check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await syncUserDocument(user);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin,
    signInWithGoogle,
    logout,
    updateUserProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
