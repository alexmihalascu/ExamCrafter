import { createContext, useContext } from 'react';
import type { User, UserCredential } from 'firebase/auth';

export interface UpdateProfilePayload {
  displayName?: string;
  photoURL?: string;
}

export interface AuthContextValue {
  currentUser: User | null;
  userRole: string | null;
  isAdmin: () => boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  updateUserProfile: (payload: UpdateProfilePayload) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
