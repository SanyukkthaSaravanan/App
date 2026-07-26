import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, token as tokenStore, type AuthUser, type OnboardingInput } from '../lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  completeOnboarding: (data: OnboardingInput) => Promise<void>;
  logout: () => void;
}

// Local backstop so onboarding never loops even if the DB columns aren't
// migrated yet (server flag is authoritative once available).
const onboardedKey = (id: string) => `flaire_onboarded_${id}`;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from stored token
  useEffect(() => {
    const restore = async () => {
      const t = tokenStore.get();
      if (!t) { setIsLoading(false); return; }
      try {
        const { user: me } = await authApi.me();
        setUser(me);
      } catch {
        // Token invalid/expired — clear it
        tokenStore.clear();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    tokenStore.set(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (
    email: string, username: string, password: string, firstName?: string, lastName?: string
  ) => {
    // Create the account only — do NOT log the user in. They must log in
    // afterwards with their new credentials.
    await authApi.register(email, username, password, firstName, lastName);
  }, []);

  const completeOnboarding = useCallback(async (data: OnboardingInput) => {
    await authApi.onboarding(data);
    if (user) localStorage.setItem(onboardedKey(user.id), '1');
    setUser((prev) =>
      prev
        ? {
            ...prev,
            onboardingCompleted: true,
            condition: data.condition ?? prev.condition,
            trackedFactors: data.trackedFactors ?? prev.trackedFactors,
            knownTriggers: data.knownTriggers ?? prev.knownTriggers,
          }
        : prev
    );
  }, [user]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const needsOnboarding =
    !!user &&
    !user.onboardingCompleted &&
    localStorage.getItem(onboardedKey(user.id)) !== '1';

  return (
    <AuthContext.Provider
      value={{ user, isLoading, needsOnboarding, login, register, completeOnboarding, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
