import { createContext } from 'react';

import type { User } from 'src/types/user';
import { Issuer } from 'src/utils/auth';

export interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

export interface AuthContextType extends State {
  issuer: Issuer.Amplify;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resendSignUp: (username: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  forgotPasswordSubmit: (username: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  issuer: Issuer.Amplify,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  confirmSignUp: () => Promise.resolve(),
  resendSignUp: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  forgotPasswordSubmit: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
});
