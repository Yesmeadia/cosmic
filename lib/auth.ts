import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from './firebase';

// Session timeout duration in milliseconds (1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
let sessionTimer: NodeJS.Timeout | null = null;
let lastActivityTime: number = Date.now();

// Reset the session timer
const resetSessionTimer = () => {
  lastActivityTime = Date.now();
  
  if (sessionTimer) clearTimeout(sessionTimer);
  
  sessionTimer = setTimeout(async () => {
    console.log('Session expired due to inactivity');
    await signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, SESSION_TIMEOUT);
};

// Initialize activity listeners
export const initSessionTimeout = () => {
  if (typeof window === 'undefined') return;

  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];

  let debounceTimer: NodeJS.Timeout | null = null;
  const debouncedResetTimer = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(resetSessionTimer, 1000);
  };

  activityEvents.forEach(event =>
    window.addEventListener(event, debouncedResetTimer, true)
  );

  resetSessionTimer();

  return () => {
    activityEvents.forEach(event =>
      window.removeEventListener(event, debouncedResetTimer, true)
    );
    if (sessionTimer) clearTimeout(sessionTimer);
    if (debounceTimer) clearTimeout(debounceTimer);
  };
};

export const clearSessionTimer = () => {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
};

export const getRemainingSessionTime = (): number => {
  const elapsed = Date.now() - lastActivityTime;
  const remaining = SESSION_TIMEOUT - elapsed;
  return Math.max(0, remaining);
};

export const isSessionValid = (): boolean => {
  return getRemainingSessionTime() > 0;
};

// ---------------------------
// ✅ SIGN IN WITH VERIFICATION CHECK
// ---------------------------
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Reload user to get updated emailVerified state
    await user.reload();

    // Check if email is verified
    if (!user.emailVerified) {
      await firebaseSignOut(auth); // sign out immediately
      return { success: false, error: 'Please verify your email before signing in.' };
    }

    // Start session tracking only for verified users
    initSessionTimeout();

    return { success: true, user };
  } catch (error: unknown) {
    console.error('Error signing in:', error);
    let message = 'Failed to sign in';
    if (error instanceof FirebaseError) {
      message = error.message;
    } else if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message: string }).message === 'string'
    ) {
      message = (error as { message: string }).message;
    }
    return { success: false, error: message };
  }
};

// ---------------------------
// ✅ SIGN OUT
// ---------------------------
export const signOut = async () => {
  try {
    clearSessionTimer();
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error signing out:', firebaseError);
    return { success: false, error: firebaseError.message };
  }
};

// ---------------------------
// ✅ AUTH STATE MONITOR
// ---------------------------
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Always reload to get latest verification status
      await user.reload();
      if (!user.emailVerified) {
        console.warn('Email not verified, signing out...');
        await firebaseSignOut(auth);
        if (typeof window !== 'undefined') {
          window.location.href = '/verify-email'; // optional route
        }
        return;
      }
      initSessionTimeout();
    } else {
      clearSessionTimer();
    }
    callback(user);
  });
};

export { auth };
