import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { ArrowLeft, KeyRound, Lock, Mail, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';
import { LOGO_ASSET_PATH } from '../data/seedData';
import { auth } from '../lib/firebase';
import { ensureUserProfile } from '../lib/firestoreService';

interface ClientLoginViewProps {
  brandName: string;
  logoUrl?: string;
  isModal?: boolean;
  onSuccess?: (user: User) => void;
  onGoogleSignIn: () => Promise<User | null>;
  onCancel?: () => void;
  onGoHome: () => void;
}

export function ClientLoginView({
  brandName,
  logoUrl,
  isModal = false,
  onSuccess,
  onGoogleSignIn,
  onCancel,
  onGoHome,
}: ClientLoginViewProps) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);
    setBusy(true);

    try {
      if (mode === 'signin') {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await ensureUserProfile(cred.user);
        onSuccess?.(cred.user);
      } else {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setBusy(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
        try {
          await sendEmailVerification(cred.user);
        } catch {
          // Ignore verification dispatch failure
        }
        await ensureUserProfile(cred.user);
        onSuccess?.(cred.user);
      }
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'Email/Password login must be enabled in Firebase Console (Authentication → Sign-in method → Email/Password). Alternatively, continue with Google below.',
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setErrorMsg(
          'Invalid email or password. Use the credentials issued by your PureCrest administrator or reset your password below.',
        );
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Switch to Sign In above.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setNoticeMsg(null);
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Enter your client email address first to receive a password reset link.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNoticeMsg(`Password reset link sent to ${email.trim()}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not dispatch reset email.');
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setBusy(true);
    try {
      const u = await onGoogleSignIn();
      if (u) onSuccess?.(u);
    } finally {
      setBusy(false);
    }
  };

  const card = (
    <div
      className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg w-full ${
        isModal ? 'max-w-md' : 'max-w-4xl grid grid-cols-1 lg:grid-cols-12'
      }`}
    >
      {!isModal && (
        <section className="lg:col-span-5 bg-[#064E3B] text-white p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <img
                src={logoUrl || LOGO_ASSET_PATH}
                alt={`${brandName} logo`}
                referrerPolicy="no-referrer"
                className="h-8 w-auto object-contain shrink-0"
              />
              <span className="font-display text-lg font-bold text-white">{brandName}</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#F6C453] tracking-wide">
                Client Portal · /portal
              </p>
              <h1 className="mt-1.5 font-display text-2xl font-bold text-white leading-tight">
                Property Owner &amp; Guest Portal
              </h1>
              <p className="mt-2.5 text-xs text-emerald-100/90 leading-relaxed">
                Access your shortlet reservations, inspection schedules, saved properties, owner
                listing submissions, and direct responses from the PureCrest hospitality desk.
              </p>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-lg p-4 space-y-2 text-xs text-emerald-100/90">
              <div className="flex items-center gap-2 font-semibold text-[#F6C453]">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Client Login Instructions</span>
              </div>
              <p className="leading-relaxed">
                Sign in with the email &amp; password created for your account by PureCrest, create
                a new account, or sign in with Google.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-100 hover:text-[#F6C453] transition-colors cursor-pointer self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {brandName} Homepage</span>
          </button>
        </section>
      )}

      <section className={`${isModal ? 'p-6 sm:p-7' : 'lg:col-span-7 p-7 sm:p-8'} space-y-5`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {mode === 'signin' ? 'Client Portal Login' : 'Create Client Account'}
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              {mode === 'signin'
                ? 'Sign in to view your bookings, inquiries, and property portfolio.'
                : 'Register a PureCrest client profile to manage stays and property requests.'}
            </p>
          </div>
          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close client login"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => void handleResetPassword()}
                  className="text-[11px] font-medium text-[#155E95] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg leading-relaxed">
              {errorMsg}
            </div>
          )}
          {noticeMsg && (
            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              {noticeMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 px-4 bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            {busy
              ? 'Please wait...'
              : mode === 'signin'
                ? 'Sign In to Client Portal'
                : 'Create Client Account'}
          </button>
        </form>

        <div className="relative flex items-center py-0.5">
          <div className="flex-grow border-t border-slate-200" />
          <span className="shrink mx-3 text-[11px] text-slate-400">or</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleGoogle()}
          className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Continue with Google
        </button>
      </section>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Client Portal Login"
      >
        {card}
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {card}
    </main>
  );
}
