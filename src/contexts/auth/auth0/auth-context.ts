import type { User } from 'src/types/user';
import { Issuer } from 'src/utils/auth';
import { createContext } from 'react';

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

type AppState = {
  returnTo?: string;
};

export interface AuthContextType extends State {
  issuer: Issuer.Auth0;
  loginWithRedirect: (appState?: AppState) => Promise<void>;
  handleRedirectCallback: () => Promise<AppState | undefined>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  issuer: Issuer.Auth0,
  loginWithRedirect: () => Promise.resolve(),
  handleRedirectCallback: () => Promise.resolve(undefined),
  logout: () => Promise.resolve(),
});
