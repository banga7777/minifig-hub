
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { updateCanonical, setNoIndex } from '../utils/seo';

const STORAGE_KEY_EMAIL = 'minifig_saved_email';
const STORAGE_KEY_PW = 'minifig_saved_password';
const STORAGE_KEY_REMEMBER = 'minifig_remember_me';

interface AuthProps {
  onShowLegalModal: (isOpen: boolean) => void; // New prop
}

const Auth: React.FC<AuthProps> = ({ onShowLegalModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{title: string, message: string} | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const navigate = useNavigate();

  // Load saved credentials on mount
  useEffect(() => {
    const savedRemember = localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true';
    if (savedRemember) {
      setRememberMe(true);
      const savedEmail = localStorage.getItem(STORAGE_KEY_EMAIL);
      const savedPw = localStorage.getItem(STORAGE_KEY_PW);
      if (savedEmail) setEmail(savedEmail);
      if (savedPw) setPassword(savedPw);
    }
  }, []);

  // Sync internal modal state with external prop for back button handling
  useEffect(() => {
    onShowLegalModal(!!showLegalModal);
  }, [showLegalModal, onShowLegalModal]);

  useEffect(() => {
    updateCanonical('/auth');
    setNoIndex(true);
    return () => setNoIndex(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        // Save or clear credentials based on "Remember Me"
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_REMEMBER, 'true');
          localStorage.setItem(STORAGE_KEY_EMAIL, email);
          localStorage.setItem(STORAGE_KEY_PW, password);
        } else {
          localStorage.removeItem(STORAGE_KEY_REMEMBER);
          localStorage.removeItem(STORAGE_KEY_EMAIL);
          localStorage.removeItem(STORAGE_KEY_PW);
        }

        navigate('/');
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          navigate('/');
        } else {
          setSuccessMsg('Account created! Please check your email inbox to verify your account.');
          setIsLogin(true);
        }
      }
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      let title = isLogin ? 'Login Failed' : 'Sign Up Failed';
      setError({ title, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-['Outfit']">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[160px] opacity-10 -mr-64 -mt-64"></div>
      
      <div className="w-full max-w-sm relative z-10">
        <header className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 rotate-3 transition-transform duration-500">
            <i className="fas fa-unlock-alt text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic uppercase">
            {isLogin ? 'Welcome' : 'Create'} <span className="text-indigo-500">Collection</span>
          </h1>
          <p className="text-slate-500 font-black italic uppercase text-[9px] tracking-[0.4em]">Personal Collection Database</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3 animate-in shake duration-500">
             <i className="fas fa-circle-exclamation text-rose-500 mt-1"></i>
             <div className="flex-1">
                <p className="text-rose-500 text-[10px] font-black uppercase mb-1">{error.title}</p>
                <p className="text-rose-400/80 text-[11px] font-medium leading-relaxed">{error.message}</p>
             </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3 animate-in fade-in duration-500">
             <i className="fas fa-circle-check text-emerald-500 mt-1"></i>
             <p className="text-emerald-400 text-[11px] font-medium leading-relaxed">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium placeholder:text-slate-700 text-sm transition-all"
                placeholder="Email Address"
              />
              <i className="fas fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-700"></i>
            </div>
            <div className="relative">
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium placeholder:text-slate-700 text-sm transition-all"
                placeholder="Password"
              />
              <i className="fas fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-slate-700"></i>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between px-2 py-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-transparent border-white/10 group-hover:border-white/20'}`}>
                    {rememberMe && <i className="fas fa-check text-[10px] text-white"></i>}
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Remember Me</span>
              </label>
              {/* "Forgot?" 버튼 삭제됨 */}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase text-xs tracking-[0.3em] rounded-[1.5rem] shadow-xl mt-4 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <i className="fas fa-circle-notch animate-spin text-lg"></i>
            ) : (
              isLogin ? 'Sign In Now' : 'Create My Account'
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="px-6 py-3 rounded-full border border-white/5 bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-16 text-center opacity-30">
          <p className="text-[7px] text-white font-black uppercase tracking-[0.3em] leading-relaxed">
            By using this app, you agree to our<br/>
            <button onClick={() => setShowLegalModal('terms')} className="underline">Terms of Service</button> & <button onClick={() => setShowLegalModal('privacy')} className="underline">Privacy Policy</button>
          </p>
        </div>
      </div>

      {showLegalModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowLegalModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-300">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 border-b border-slate-100 pb-4">
              {showLegalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>
            <div className="flex-1 overflow-y-auto text-[11px] text-slate-500 leading-relaxed font-medium pr-4 custom-scrollbar">
              {showLegalModal === 'terms' ? (
                <div className="space-y-4">
                  <p className="font-bold text-slate-900">1. Acceptance of Terms</p>
                  <p>By accessing this app, you agree to be bound by these terms. This app is for LEGO collection tracking only.</p>
                  <p className="font-bold text-slate-900">2. Intellectual Property</p>
                  <p>LEGO® is a trademark of the LEGO Group. This application is an unofficial fan tool and is not affiliated with or endorsed by the LEGO Group.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-bold text-slate-900">1. Data Collection</p>
                  <p>We store your email and collection data securely using Supabase. We do not sell your personal information to third parties.</p>
                  <p className="font-bold text-slate-900">2. Security</p>
                  <p>Your password is encrypted at the database level. If you use "Remember Me", credentials are stored locally on your device.</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowLegalModal(null)}
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;