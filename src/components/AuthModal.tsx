import React, { useState } from 'react';
import { Mail, Lock, X, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, saveUserProfile } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialIsSignUp?: boolean;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialIsSignUp = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialIsSignUp);
    }
  }, [isOpen, initialIsSignUp]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user profile to Firestore
        await saveUserProfile(user.uid, user.email || email);
      } else {
        // Sign in user
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Clean up and close modal
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      
      const firebaseError = err as any;
      setError(`${firebaseError.code}: ${firebaseError.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm" id="auth-modal-overlay">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-100 bg-white p-6 shadow-2xl transition-all sm:p-8"
        id="auth-modal-box"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/4 h-24 w-48 rounded-full bg-amber-500/5 blur-2xl" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all cursor-pointer"
          aria-label="Close modal"
          id="auth-modal-close-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 mb-3 shadow-inner border border-amber-100">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#1c1917]">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h3>
          <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto font-light leading-relaxed">
            {isSignUp 
              ? 'Join us to save your favorite products, write reviews, and track prices.' 
              : 'Sign in to access your profile and track your favorite products.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 flex items-start space-x-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100" id="auth-error-alert">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-stone-400 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-xs text-stone-800 outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-200"
                id="auth-email-input"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-stone-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-10 text-xs text-stone-800 outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-200"
                id="auth-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                id="auth-password-toggle"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for Sign Up) */}
          {isSignUp && (
            <div className="space-y-1" id="confirm-password-container">
              <label className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-stone-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={isSignUp}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-10 text-xs text-stone-800 outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-200"
                  id="auth-confirm-password-input"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-amber-850 hover:bg-amber-900 disabled:bg-amber-800/60 py-3 text-xs font-bold text-white uppercase tracking-wider shadow-md transition-all mt-6 cursor-pointer"
            id="auth-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Toggle Modal View */}
        <div className="mt-5 text-center text-xs text-stone-500 border-t border-stone-100 pt-4">
          <span>{isSignUp ? 'Already have an account?' : 'New to Alankapriya?'} </span>
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-bold text-amber-800 hover:underline cursor-pointer"
            id="auth-toggle-mode-btn"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
