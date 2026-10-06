import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { validateLogin, type LoginErrors } from '@/services/login.validation';
import { clearSession, getSession, saveSession, type Session } from '@/services/session.service';

type SignInResult = { ok: true } | { ok: false; errors: LoginErrors; message?: string };

type SessionContextValue = {
  isLoading: boolean; // true until the stored session has been read
  session: Session | null;
  signIn: (identifier: string, secret: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;

    getSession()
      .catch(() => null) // getSession never throws today; stay signed out if that changes
      .then((stored) => {
        if (!active) return;
        setSession(stored);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (identifier: string, secret: string): Promise<SignInResult> => {
    const result = validateLogin(identifier, secret);
    if (!result.ok) return { ok: false, errors: result.errors };

    try {
      setSession(await saveSession(result.userId));
      return { ok: true };
    } catch {
      return { ok: false, errors: {}, message: 'We couldn’t sign you in on this device. Please try again.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await clearSession();
    } catch (error) {
      console.error('Clearing the stored session failed', error);
    } finally {
      setSession(null); // the route guards redirect to the login screen
    }
  }, []);

  const value = useMemo(() => ({ isLoading, session, signIn, signOut }), [isLoading, session, signIn, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}
