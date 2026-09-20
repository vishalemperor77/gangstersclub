import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import api, { clearCache } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [application, setApplication] = useState(null);

  const loadIdentity = useCallback(async () => {
    const fetchIdentity = async () => {
      // api.js resolves with the payload itself ({ user, profile, membership,
      // application }) — it is NOT wrapped in supabase's `{ data, error }` shape.
      // Destructuring `{ data }` here left `data` undefined, so loadIdentity()
      // threw on every call and every signed-in user (admins included) was
      // treated as a stranger: /admin redirected to "Access Denied".
      const data = await api.me();
      setProfile(data.profile);
      setMembership(data.membership);
      setApplication(data.application);
      return data;
    };

    try {
      return await fetchIdentity();
    } catch (err) {
      // A transient hiccup (rate limit, cold start, dropped connection) must not
      // make a signed-in member look like a stranger: /admin would bounce the
      // admin to "Access Denied" and /member to "Pending". Retry once before
      // clearing the identity. Only a real answer (401/403/404) clears it.
      const transient = !err?.status || err.status === 429 || err.status >= 500;
      if (transient) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        try {
          return await fetchIdentity();
        } catch {
          /* fall through to the signed-out state below */
        }
      }
      setProfile(null);
      setMembership(null);
      setApplication(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      if (data.session) await loadIdentity();
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      clearCache();
      if (newSession) {
        await loadIdentity();
      } else {
        setProfile(null);
        setMembership(null);
        setApplication(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadIdentity]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async ({ email, password, username, full_name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, full_name } },
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    clearCache();
    setProfile(null);
    setMembership(null);
    setApplication(null);
    await supabase.auth.signOut();
  }, []);

  const refresh = useCallback(async () => {
    clearCache();
    return loadIdentity();
  }, [loadIdentity]);

  const value = useMemo(
    () => ({
      loading,
      session,
      profile,
      membership,
      application,
      isAdmin: profile?.role === 'admin',
      isActiveMember:
        profile?.role === 'admin' ||
        (profile?.status === 'active' && membership?.status === 'active'),
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
      refresh,
    }),
    [loading, session, profile, membership, application, signIn, signUp, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
