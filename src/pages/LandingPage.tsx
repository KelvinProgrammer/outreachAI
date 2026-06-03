import React, { useState, useEffect } from 'react';
import { Zap, Search, Brain, Mail, ChevronRight, Play, Terminal, ArrowRight, ShieldCheck, Users } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [typingIndex, setTypingIndex] = useState(0);

  const demoEmail = `Subject: Travel collaboration inquiry | OutreachAI x @wild_explorer

Hey Sarah,

I came across your travel lifestyle profile on Instagram and was absolutely blown away by your recent UGC reels in Amalfi! The color grading is stunning.

I think your creative style would be a perfect match for our upcoming Summer Wanderlust campaign. Let's set up a quick 10-minute chat this Friday.

Best regards,
Kelvin @ OutreachAI`;

  useEffect(() => {
    if (typingIndex < demoEmail.length && isTyping) {
      const timeout = setTimeout(() => {
        setTerminalText((prev) => prev + demoEmail.charAt(typingIndex));
        setTypingIndex((prev) => prev + 1);
      }, 15);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setTerminalText('');
        setTypingIndex(0);
      }, 5000);
      return () => clearTimeout(resetTimeout);
    }
  }, [typingIndex, isTyping]);

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] font-sans min-h-screen overflow-x-hidden relative select-none">
      {/* Background radial neon glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00daf3]/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#4edea3]/5 blur-[150px] pointer-events-none z-0"></div>

      {/* Floating Header */}
      <header className="flex justify-between items-center px-6 md:px-12 h-20 w-full z-40 bg-[#0b1326]/85 backdrop-blur-md border-b border-[#3b494c]/40 fixed top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
          <Zap className="text-[#00e5ff] fill-[#00daf3]/10" size={24} />
          <span className="font-display text-2xl font-bold text-white tracking-wider">
            Outreach<span className="text-[#00daf3]">AI</span>
          </span>
        </div>

        <button
          onClick={() => onNavigate('/dashboard')}
          className="text-xs font-bold font-mono tracking-wider py-2.5 px-5 bg-[#00a572] hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] text-[#003824] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <span>OPERATOR CONSOLE</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#171f33] border border-[#00daf3]/20 rounded-full text-xs font-mono font-medium text-[#00daf3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            Agentic Outbound Leads Engine v2.0
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Precision Sales <br className="hidden sm:inline" />
            Outreach, Powered by <br />
            <span className="bg-linear-to-r from-[#00daf3] via-[#00e5ff] to-[#4edea3] bg-clip-text text-transparent">
              Agentic Intelligence
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Locate travel UGC creators, scrape verified emails organically, personalize cold outreach copies dynamically with DeepSeek API, and dispatch SSL-secured SMTP drip lists—all inside a stunning dark operator terminal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="py-4 px-8 bg-[#00e5ff] hover:bg-[#9cf0ff] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] text-[#001f24] font-display font-bold text-sm rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={16} fill="currentColor" />
              Launch Operator Terminal
            </button>
            
            <a
              href="#features"
              className="py-4 px-6 border border-[#3b494c] hover:border-slate-400 text-slate-300 hover:text-white font-display text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore Engine Blueprint</span>
              <ChevronRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#3b494c]/30 max-w-lg">
            <div>
              <div className="text-2xl font-bold font-display text-white">100%</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Selenium Organic</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[#4edea3]">0%</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Simulation Flags</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[#00daf3]">98%</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Inbound Delivery</div>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal Widget */}
        <div className="lg:col-span-6">
          <div className="bg-[#060e20] border border-[#3b494c] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[400px]">
            {/* Terminal Header */}
            <div className="h-10 bg-[#131b2e] border-b border-[#3b494c]/40 px-4 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tracking-wider flex items-center gap-1.5">
                <Terminal size={12} />
                nexus-personalizer-core.bin
              </span>
              <div className="w-8"></div>
            </div>
            
            {/* Terminal Body */}
            <div className="flex-1 p-5 font-mono text-left text-xs overflow-y-auto leading-relaxed selection:bg-[#00daf3]/20">
              <div className="flex gap-2 text-slate-500 select-none">
                <span>$</span>
                <span>outreachai --target @wild_explorer --niche "travel" --run</span>
              </div>
              <div className="text-[#4edea3] mt-1 select-none">
                [SUCCESS] Connected to live DeepSeek copywriting engine. Personalizing email...
              </div>
              <div className="text-slate-300 mt-4 whitespace-pre-wrap font-sans text-[11px] leading-relaxed">
                {terminalText}
                <span className="w-2 h-4 bg-[#00daf3] inline-block animate-pulse ml-0.5 align-middle"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#3b494c]/30 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#00daf3]">SYSTEM BLUEPRINT</h2>
          <p className="font-display text-3xl font-extrabold text-white">Full-Stack Prospecting Pipeline</p>
          <p className="text-xs text-slate-400 font-sans">
            Our platform provides absolute end-to-end capabilities, taking your target searches to final inbox replies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#171f33] border border-[#3b494c] rounded-2xl p-8 text-left hover:border-[#00daf3]/60 hover:shadow-[0_10px_30px_rgba(0,218,243,0.05)] transition-all group">
            <div className="p-3.5 bg-blue-950/50 text-[#00daf3] rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Search size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mt-6">Visible Chrome Scraper</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
              Spawns visible, stealthy Selenium Chrome browsers to navigate Google results organically. Implements slowly typed keywords, step-incremental scrolling, and automatic pagination to harvest email addresses safely.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#171f33] border border-[#3b494c] rounded-2xl p-8 text-left hover:border-purple-500/60 hover:shadow-[0_10px_30px_rgba(168,85,247,0.05)] transition-all group">
            <div className="p-3.5 bg-purple-950/50 text-purple-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Brain size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mt-6">AI-Powered Copywriting</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
              Leverages high-performing Gemini and DeepSeek API prompts to write ultra-personalized email subjects and bodies. Automatically references niche topics, creators names, and platform source directories in real time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#171f33] border border-[#3b494c] rounded-2xl p-8 text-left hover:border-emerald-500/60 hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)] transition-all group">
            <div className="p-3.5 bg-emerald-950/50 text-[#4edea3] rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Mail size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mt-6">Secure SMTP Dispatcher</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
              Configures custom host domains, port protocols, and usernames securely in the SQLite registry. Enforces antispam delay jitters, unsubscribe compliance link footers, and secure SSL/TLS server dispatches.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section className="py-16 bg-[#060e20] border-t border-b border-[#3b494c]/20 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex gap-4 items-start text-left">
            <div className="p-3.5 bg-emerald-950/40 text-[#4edea3] rounded-xl shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-white">Full Drip Sequencer & Opt-Outs</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Platform is built with GDPR and CAN-SPAM opt-out standards. Outreach drips append an automated opt-out link in the footer that updates SQLite status dynamically when recipients request unsubscription.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start text-left">
            <div className="p-3.5 bg-blue-950/40 text-[#00daf3] rounded-xl shrink-0">
              <Users size={26} />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-white">Database Integrity</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Leads are safely initialized in local SQLite registry files (`leads.db`). General credentials and settings are hashed/masked securely to protect your active DeepSeek and SMTP password vectors from client-side leaks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Workspace */}
      <section className="py-24 px-6 md:px-12 text-center max-w-3xl mx-auto relative z-10">
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Ready to Automate Your Manual <br />
          Outbound Pipelines?
        </h2>
        <p className="text-xs text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
          Open the Chrome visible display browser, type search vectors slowly, customize tone copywriting grids, and deploy sequences in background threads safely.
        </p>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="mt-8 py-4.5 px-8 bg-[#00a572] hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(78,222,163,0.4)] text-[#003824] font-display font-bold text-sm rounded-xl transition-all active:scale-98 cursor-pointer flex items-center gap-2 mx-auto"
        >
          <span>Enter Operator Console</span>
          <ChevronRight size={18} />
        </button>
      </section>

      {/* Footer minimal Kenyan attribution */}
      <footer className="py-12 border-t border-[#3b494c]/20 px-6 text-center select-none text-[11px] text-slate-500 font-mono relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          © 2026 OutreachAI Nexus. All rights reserved. Precision Lead Generation.
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Engineered in Nairobi by</span>
          <a
            href="mailto:mwangikelvin3@gmail.com"
            className="text-[#00daf3] hover:underline font-semibold"
          >
            Kelvin
          </a>
        </div>
      </footer>
    </div>
  );
};
