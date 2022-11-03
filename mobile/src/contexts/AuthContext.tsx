import { createContext, ReactNode, useEffect, useState } from "react";
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { api } from "../lib/api";

WebBrowser.maybeCompleteAuthSession();

interface UserProps {
  user: string;
  avatarUrl: string;
}

interface AuthContextData {
  user: UserProps;
  isUserLoading: boolean;
  signIn: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: AuthProviderProps) {
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [user, setUser] = useState<UserProps>({} as UserProps);
  const [_request, response, promptAsync] = Google.useAuthRequest({
    clientId: '1084891580119-052fbjmtnura7ukubtl0f5rpvdjobili.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email']
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken);
    }
  }, [response])

  async function signIn() {
    try {
      setIsUserLoading(true);
      await promptAsync();
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      setIsUserLoading(false);
    }
  }

  async function signInWithGoogle(access_token: string) {
    try {
      setIsUserLoading(true);
      const tokenResponse = await api.post('/users', {
        access_token
      });

      api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`;

      const userInfoResponse = await api.get('/me');

      setUser(userInfoResponse.data.user);
    } catch (err) {
      console.log(err)
      throw err;
    } finally {
      setIsUserLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{
      signIn,
      isUserLoading,
      user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

