import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TOKEN_STORAGE_KEY, fetchCurrentUser } from "../lib/api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  authLoading: false,
  setSession: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const profile = await fetchCurrentUser();
        if (!cancelled) {
          setUser(profile);
        }
      } catch (error) {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const setSession = useCallback(({ token: newToken, user: userData }) => {
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      authLoading,
      setSession,
      logout,
    }),
    [user, token, authLoading, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}




