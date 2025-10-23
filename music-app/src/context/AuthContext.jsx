import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [authError]);

  // Sign out
  const logout = async () => {
    setAuthError('');
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      setAuthError('Failed to sign out');
    }
  };
  
  // Google Sign-in
  const signInWithGoogle = async () => {
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setAuthError('Google sign-in failed');
      return false;
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    setAuthError('');
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setAuthError('Failed to send password reset email');
      return false;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (data) => {
    setAuthError('');
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      await updateProfile(currentUser, {
        displayName: data.displayName || currentUser.displayName,
        photoURL: data.photoURL || currentUser.photoURL
      });
      
      // Refresh user data
      setCurrentUser({...currentUser});
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      setAuthError('Failed to update profile');
      return false;
    }
  };
  
  // Update user password
  const updateUserPassword = async (currentPassword, newPassword) => {
    setAuthError('');
    try {
      if (!currentUser) throw new Error('No authenticated user');
      if (!currentUser.email) throw new Error('User has no email');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      
      if (error.code === 'auth/wrong-password') {
        setAuthError('Current password is incorrect');
      } else {
        setAuthError('Failed to update password');
      }
      
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    logout,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
    updateUserPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
