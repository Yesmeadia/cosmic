
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from './firebase';

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error signing out:', firebaseError);
    return { success: false, error: firebaseError.message };
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };

