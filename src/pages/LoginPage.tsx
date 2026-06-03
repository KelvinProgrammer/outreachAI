import React, { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please populate all credential input fields.');
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Security vectors enforce a minimum password length of 6 characters.');
        setIsLoading(false);
        return;
      }

      // Save simulated session in local storage
      localStorage.setItem('nexus_user', JSON.stringify({ email }));
      setIsLoading(false);
      onNavigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] font-sans min-h-screen overflow-x-hidden relative flex flex-col justify-center items-center px-6 py-12 select-none">
      {/* Background neon glows */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#00daf3]/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#4edea3]/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Header Logo */}
      <div className="flex items-center gap-2 cursor-pointer mb-8 z-10" onClick={() => onNavigate('/')}>
        <Zap className="text-[#00e5ff] fill-[#00daf3]/10" size={28} />
        <span className="font-display text-2xl font-bold text-white tracking-wider">
          Outreach<span className="text-[#00daf3]">AI</span>
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#171f33]/80 backdrop-blur-md border border-[#3b494c] rounded-2xl p-8 shadow-2xl z-10 text-left relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#00daf3] to-[#4edea3] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-550"></div>
        
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">Access Console Registry</h2>
        <p className="text-xs text-slate-400 mt-1.5">Enter credentials to initialize operational dashboard components.</p>

        {errorMsg && (
          <div className="bg-rose-950/40 text-rose-300 text-xs p-3 rounded border border-rose-800/20 mt-4 leading-normal">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4.5 mt-6 font-sans">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Operator Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={14} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@nexus.com"
                className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#00daf3] outline-none transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <label>Console Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/signup')}
                className="text-[#00daf3] hover:underline cursor-pointer font-bold"
              >
                Reset vector?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={14} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg pl-9 pr-10 py-2.5 text-xs text-white focus:border-[#00daf3] outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2 py-1 select-none">
            <input
              type="checkbox"
              id="remember-me"
              className="w-4 h-4 rounded border-[#3b494c] bg-[#171f33] text-[#00daf3] focus:ring-[#00daf3] cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-xs text-slate-300 cursor-pointer">
              Remember active terminal session
            </label>
          </div>

          {/* Login trigger */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00daf3] hover:bg-[#9cf0ff] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] text-slate-900 font-display font-bold text-xs py-3 rounded-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? 'Decrypting...' : 'Initialize Decryption'}
            {!isLoading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-400 text-xs">
          New operator?{' '}
          <button
            onClick={() => onNavigate('/signup')}
            className="text-[#4edea3] hover:underline font-bold cursor-pointer"
          >
            Deploy New Vector Profile
          </button>
        </div>
      </div>
    </div>
  );
};
