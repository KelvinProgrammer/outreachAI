import React, { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, User, Settings } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (path: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [senderName, setSenderName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(async () => {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please populate all required input vectors.');
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Security standards enforce a minimum password length of 6 characters.');
        setIsLoading(false);
        return;
      }

      // Save simulated session in local storage
      localStorage.setItem('nexus_user', JSON.stringify({ email, name }));

      // Dynamically auto-seed SMTP Sender Name to FastAPI database if custom name is entered!
      if (senderName.trim()) {
        try {
          await fetch('http://localhost:8000/api/smtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: 'smtp.gmail.com',
              port: 587,
              username: email,
              password: '********', // Masked bypass
              use_tls: 1,
              sender_email: email,
              sender_name: senderName.trim()
            })
          });
        } catch (err) {
          console.error("Auto-SMTP config seed failed:", err);
        }
      }

      setIsLoading(false);
      onNavigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] font-sans min-h-screen overflow-x-hidden relative flex flex-col justify-center items-center px-6 py-12 select-none">
      {/* Background neon glows */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#00daf3]/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#4edea3]/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Header Logo */}
      <div className="flex items-center gap-2 cursor-pointer mb-6 z-10" onClick={() => onNavigate('/')}>
        <Zap className="text-[#00e5ff] fill-[#00daf3]/10" size={28} />
        <span className="font-display text-2xl font-bold text-white tracking-wider">
          Outreach<span className="text-[#00daf3]">AI</span>
        </span>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-[#171f33]/80 backdrop-blur-md border border-[#3b494c] rounded-2xl p-8 shadow-2xl z-10 text-left relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#4edea3] to-[#00daf3] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-550"></div>
        
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">Deploy Vector Profile</h2>
        <p className="text-xs text-slate-400 mt-1.5">Register as an active console operator to unlock automation modules.</p>

        {errorMsg && (
          <div className="bg-rose-950/40 text-rose-300 text-xs p-3 rounded border border-rose-800/20 mt-4 leading-normal">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4.5 mt-6 font-sans">
          {/* Full Name field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User size={14} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kelvin Mwangi"
                className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#00daf3] outline-none transition-all"
              />
            </div>
          </div>

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
            <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Console Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={14} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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

          {/* Default Sender Name field (SMTP sync) */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
              Default SMTP Sender Name <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Settings size={14} />
              </span>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Collaborations Desk"
                className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg pl-9 pr-4 py-2.5 text-xs text-white focus:border-[#00daf3] outline-none transition-all"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-2 py-1 select-none">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 rounded border-[#3b494c] bg-[#171f33] text-[#00daf3] focus:ring-[#00daf3] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-300 cursor-pointer">
              Agree to anti-spam compliance guidelines
            </label>
          </div>

          {/* Signup trigger */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4edea3] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(78,222,163,0.3)] text-[#003824] font-display font-bold text-xs py-3 rounded-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? 'Seeding Profile...' : 'Seeding Operator Node'}
            {!isLoading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-400 text-xs">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="text-[#00daf3] hover:underline font-bold cursor-pointer"
          >
            Access Decryption Panel
          </button>
        </div>
      </div>
    </div>
  );
};
