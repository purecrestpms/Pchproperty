import { sendPasswordResetEmail, signInWithEmailAndPassword, type User } from 'firebase/auth';
import { ArrowLeft, Copy, Check, KeyRound, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { BOOTSTRAPPED_ADMIN_EMAIL, LOGO_ASSET_PATH } from '../data/seedData';
import { auth } from '../lib/firebase';
import { ensureUserProfile } from '../lib/firestoreService';

interface AdminLoginViewProps {
  brandName: string;
  logoUrl?: string;
  user: User | null;
  isAdmin: boolean;
  onGoogleSignIn: () => Promise<User | null>;
  onSignOut: () => Promise<void>;
  onOpenPortal: () => void;
  onGoHome: () => void;
}

export function AdminLoginView({
  brandName,
  logoUrl,
  user,
  isAdmin,
  onGoogleSignIn,
  onSignOut,
  onOpenPortal,
  onGoHome,
}: AdminLoginViewProps) {
  const [email, setEmail] = useState(BOOTSTRAPPED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSent(false);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await ensureUserProfile(cred.user);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'Email/Password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method → Email/Password). Use "Sign In with Google" below with purecresthospitality@gmail.com for instant root access.',
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setErrorMsg(
          'Incorrect email or password, or account does not yet have a Firebase password set. Use "Sign In with Google" or reset your password.',
        );
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg(null);
    setResetSent(false);
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Enter an email address above to send a password reset email.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to send password reset email. Ensure Email/Password provider is enabled in Firebase Console.',
      );
    }
  };

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2500);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Info & Authorized Access Credentials Card */}
        <section className="lg:col-span-5 bg-[#064E3B] text-white rounded-xl p-7 flex flex-col justify-between space-y-6">
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
                Protected Route · /admin
              </p>
              <h1 className="mt-1.5 font-display text-2xl font-bold text-white leading-tight">
                Admin CMS &amp; Operations Portal
              </h1>
              <p className="mt-2.5 text-xs text-emerald-100/90 leading-relaxed">
                Manage homepage imagery, site logo, property &amp; multi-room shortlet inventory,
                Journal blog articles, service pages, customer bookings, and delegated team access.
              </p>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-lg p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#F6C453]">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Authorized Admin Credentials</span>
              </div>
              <div className="space-y-1 text-emerald-100/90">
                <div>
                  <span className="text-emerald-200/75">Root Admin Email:</span>{' '}
                  <span className="font-mono font-semibold text-white select-all">
                    {BOOTSTRAPPED_ADMIN_EMAIL}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-200/75">Authentication:</span>{' '}
                  <span>Verified Google Sign-In or Firebase Email/Password</span>
                </div>
                <div>
                  <span className="text-emerald-200/75">Delegated Team Access:</span>{' '}
                  <span>Assigned by UID inside Admin Console → Admins &amp; Access</span>
                </div>
              </div>
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

        {/* Right Sign-In Form */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-7 sm:p-8 flex flex-col justify-center space-y-6">
          {user && !isAdmin ? (
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Administrator Clearance Required
                </h2>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  You are currently signed in as{' '}
                  <span className="font-semibold text-slate-900">{user.email}</span>, which does not
                  currently hold root or delegated Admin CMS clearance.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                <div className="font-semibold text-slate-900">Your Signed-In Firebase UID</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-slate-700 break-all">{user.uid}</code>
                  <button
                    type="button"
                    onClick={() => void handleCopyUid()}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-100 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedUid ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy UID</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Root admin ({BOOTSTRAPPED_ADMIN_EMAIL}) can grant this UID access inside Admins
                  &amp; Access, or you can switch accounts below.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void onSignOut()}
                  className="px-4 py-2.5 text-xs font-semibold bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg cursor-pointer"
                >
                  Sign Out &amp; Switch Account
                </button>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="px-4 py-2.5 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                >
                  Open Client Portal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Sign In to Admin Console
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Authenticate with your authorized PureCrest Google account or Firebase Admin
                  credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void onGoogleSignIn()}
                className="w-full py-3 px-4 bg-[#064E3B] hover:bg-emerald-950 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#F6C453]" />
                <span>Sign In with Google ({BOOTSTRAPPED_ADMIN_EMAIL})</span>
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="shrink mx-3 text-[11px] font-medium text-slate-400">
                  or sign in with email &amp; password
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Admin Email
                  </label>
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
                    <button
                      type="button"
                      onClick={() => void handlePasswordReset()}
                      className="text-[11px] font-medium text-[#155E95] hover:underline cursor-pointer"
                    >
                      Send password reset
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
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

                {resetSent && (
                  <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
                    Password reset email dispatched to {email}. Check your inbox to set a password.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-2.5 px-4 bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {busy ? 'Authenticating...' : 'Sign In with Credentials'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
