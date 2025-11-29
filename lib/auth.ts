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
  
  if (sessionTimer) {
    clearTimeout(sessionTimer);
  }
  
  sessionTimer = setTimeout(async () => {
    console.log('Session expired due to inactivity');
    await signOut();
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, SESSION_TIMEOUT);
};

// Initialize activity listeners
export const initSessionTimeout = () => {
  if (typeof window === 'undefined') return;

  // List of events that indicate user activity
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
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      resetSessionTimer();
    }, 1000); // Reset at most once per second
  };

  // Add event listeners for user activity
  activityEvents.forEach(event => {
    window.addEventListener(event, debouncedResetTimer, true);
  });

  // Start the initial timer
  resetSessionTimer();

  // Return cleanup function
  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, debouncedResetTimer, true);
    });
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };
};

// Clear session timer
export const clearSessionTimer = () => {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
};

// Get remaining session time in milliseconds
export const getRemainingSessionTime = (): number => {
  const elapsed = Date.now() - lastActivityTime;
  const remaining = SESSION_TIMEOUT - elapsed;
  return Math.max(0, remaining);
};

// Check if session is still valid
export const isSessionValid = (): boolean => {
  return getRemainingSessionTime() > 0;
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Initialize session timeout after successful login
    initSessionTimeout();
    
    return { success: true, user: userCredential.user };
  } catch (error: unknown) {
    console.error('Error signing in:', error);
    let message = 'Failed to sign in';
    if (error instanceof FirebaseError) {
      message = error.message;
    } else if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    return {
      success: false,
      error: message
    };
  }
};

export const signOut = async () => {
  try {
    // Clear session timer before signing out
    clearSessionTimer();
    
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error signing out:', firebaseError);
    return { success: false, error: firebaseError.message };
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Initialize session timeout when user is authenticated
      initSessionTimeout();
    } else {
      // Clear session timer when user is logged out
      clearSessionTimer();
    }
    callback(user);
  });
};

export { auth };