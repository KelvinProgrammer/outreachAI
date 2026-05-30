import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, RefreshCw, Send, HelpCircle, Check, Brain, Mail } from 'lucide-react';
import { Lead } from '../types';

interface OutreachGeneratorProps {
  selectedLead: Lead | null;
  onSaveTemplate: (leadId: string, subject: string, body: string) => void;
  leads: Lead[];
}

export const OutreachGenerator: React.FC<OutreachGeneratorProps> = ({
  selectedLead: initialLead,
  onSaveTemplate,
  leads,
}) => {
  const [activeLead, setActiveLead] = useState<Lead | null>(initialLead);
  const [promptStyle, setPromptStyle] = useState<string>('Standard Professional');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentSuccessMsg, setSentSuccessMsg] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (initialLead) {
      setActiveLead(initialLead);
      setIsSaved(false);
      setSubject(initialLead.generated_subject || '');
      setBody(initialLead.generated_body || '');
    }
  }, [initialLead]);

  useEffect(() => {
    if (initialLead) {
      setActiveLead(initialLead);
      const currentFullLead = leads.find(l => l.id === initialLead.id);
      if (currentFullLead) {
        setSubject(currentFullLead.generated_subject || '');
        setBody(currentFullLead.generated_body || '');
      }
    }
  }, [initialLead, leads]);

  // Handle changing prompts styles
  const styles = [
    { name: 'Standard Professional', prompt: 'Keep it highly polite, introducing OutreachAI capabilities.' },
    { name: 'Technical / Developer Focus', prompt: 'Incorporate dev-friendly language about automated scraping pipelines, scrapers, and proxies.' },
    { name: 'Casual & Modern', prompt: 'Keep the tone conversational, friendly, and very warm. Start with a congratulations on their role.' },
    { name: 'Direct Pitch', prompt: 'Short, direct business inquiry aiming for a 10-minute demo session.' }
  ];

  const handleSelectStyle = (stylePrompt: string, styleName: string) => {
    setPromptStyle(styleName);
    setCustomPrompt(stylePrompt);
  };

  const handleGenerate = async () => {
    if (!activeLead) return;

    setIsLoading(true);
    setErrorMsg(null);
    setHasCopied(false);
    setIsSaved(false);

    try {
      // First try DeepSeek generator via Python backend
      const response = await fetch(`http://localhost:8000/api/generate/${activeLead.id}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Database generation returned error');
      }

      const data = await response.json();
      setSubject(data.subject || '');
      setBody(data.body || '');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('DeepSeek key missing or error. Falling back to Gemini outreach generator...');
      
      // Fallback to local server's Gemini prompt generation!
      try {
        const geminiResponse = await fetch('/api/generate-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadName: activeLead.name,
            leadTitle: activeLead.title,
            leadCompany: activeLead.company,
            leadPlatform: activeLead.platform,
            customPrompt: customPrompt
          })
        });
        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          setSubject(geminiData.subject || '');
          setBody(geminiData.body || '');
          setErrorMsg(null);
        } else {
          throw new Error('Gemini fallback failed');
        }
      } catch (geminiErr) {
        // Safe heuristic fallback
        setSubject(`Collaboration Inquiry | OutreachAI x ${activeLead.company}`);
        setBody(`Hey ${activeLead.name},\n\nHope this finds you well!\n\nReaching out because I saw your UGC creator profile via ${activeLead.platform} and loved your lifestyle and travel content.\n\nWe would love to discuss a collaboration. Are you available for a quick chat?\n\nBest regards,\nCollaborations Team`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!activeLead) return;
    setIsSending(true);
    setErrorMsg(null);
    setSentSuccessMsg(null);
    
    try {
      // Save current edits first so that the sent email matches the operator's changes
      await fetch(`http://localhost:8000/api/leads/${activeLead.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      });
      
      const response = await fetch(`http://localhost:8000/api/send/${activeLead.id}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || 'SMTP Authentication failed or connection timed out.');
      }
      
      setSentSuccessMsg('SUCCESS: Email dispatched successfully via SMTP server!');
      setIsSaved(true);
      setTimeout(() => {
        setSentSuccessMsg(null);
        setIsSaved(false);
      }, 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'SMTP Server failed to route mail. Check credentials in System Settings.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSave = () => {
    if (!activeLead || !subject || !body) return;
    onSaveTemplate(activeLead.id, subject, body);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration Column */}
      <div className="lg:col-span-5 bg-[#171f33] rounded-xl border border-[#3b494c] p-6 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#3b494c]/60 pb-3">
          <Brain className="text-[#00daf3]" size={18} />
          <h3 className="font-display font-semibold text-[#dae2fd] text-base">
            Outreach AI Copilot
          </h3>
        </div>

        {/* Lead Selector drop-down */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
            1. Select Prospect Target
          </label>
          <select
            value={activeLead?.id || ''}
            onChange={(e) => {
              const selected = leads.find((l) => l.id === e.target.value);
              if (selected) {
                setActiveLead(selected);
                setSubject('');
                setBody('');
              }
            }}
            className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg p-3 text-xs text-white focus:border-[#9cf0ff] outline-none"
          >
            <option value="" disabled>-- Choose a Lead --</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.company}) - {l.title}
              </option>
            ))}
          </select>
          {activeLead && (
            <div className="text-[11px] text-slate-400 bg-[#0b1326]/60 border border-[#3b494c]/30 rounded p-2.5 mt-1.5 flex justify-between">
              <span>Platform: <b className="text-white font-medium">{activeLead.platform}</b></span>
              <span>Fit Score: <b className="text-[#4edea3] font-mono">{activeLead.score}%</b></span>
            </div>
          )}
        </div>

        {/* Custom Presets style selectors */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
            2. Choose Copywriting Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {styles.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleSelectStyle(s.prompt, s.name)}
                className={`py-2 px-2.5 rounded text-left text-[11px] border font-sans leading-tight cursor-pointer transition-all ${
                  promptStyle === s.name
                    ? 'bg-[#00311f] border-[#4edea3] text-[#4edea3]'
                    : 'bg-[#060e20] border-[#3b494c] hover:border-[#849396] text-slate-300'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input prompt */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
            3. Append Directives / Constraints
          </label>
          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => {
              setCustomPrompt(e.target.value);
              setPromptStyle('Custom');
            }}
            placeholder="E.g. Request a phone call on Friday afternoon. Highlight SaaS lead generation capabilities..."
            className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg p-3 text-xs text-white placeholder-slate-500 font-sans focus:border-[#9cf0ff] outline-none transition-all"
          />
        </div>

        {/* Generate Trigger */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !activeLead}
          className="w-full bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#001f24] hover:text-[#001f24] py-3 rounded-lg font-display font-bold text-xs select-none shadow-[0_0_15px_rgba(0,229,255,0.22)] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin" size={14} />
              AI Generating...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate personalized draft
            </>
          )}
        </button>
      </div>

      {/* Draft output editor */}
      <div className="lg:col-span-7 bg-[#171f33] rounded-xl border border-[#3b494c] p-6 flex flex-col justify-between shadow-lg h-full min-h-[460px]">
        <div className="flex justify-between items-center border-b border-[#3b494c]/60 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="text-[#4edea3]" size={18} />
            <span className="font-display font-semibold text-[#dae2fd] text-base">
              Personalized Email Draft
            </span>
          </div>

          <div className="flex gap-2">
            {subject && body && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 px-2.5 bg-[#0b1326] text-xs hover:text-white border border-[#3b494c] hover:border-[#00daf3]/55 rounded flex items-center gap-1 cursor-pointer"
                  title="Copy full text"
                >
                  {hasCopied ? <Check size={12} className="text-[#4edea3]" /> : <Copy size={12} />}
                  <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="p-1 px-2.5 bg-[#00a572] hover:bg-emerald-400 text-slate-900 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                  title="Save draft to lead profile"
                >
                  {isSaved ? <Check size={12} /> : <Send size={12} />}
                  <span>{isSaved ? 'Saved' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="p-1 px-2.5 bg-[#00e5ff] hover:bg-[#9cf0ff] text-slate-900 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Send email now via SMTP"
                >
                  {isSending ? <RefreshCw className="animate-spin" size={12} /> : <Mail size={12} />}
                  <span>{isSending ? 'Sending...' : 'Send Now'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 text-rose-300 text-xs p-3 rounded border border-rose-800/20 mt-4 leading-normal flex gap-1.5 pt-4 text-left">
            <HelpCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sentSuccessMsg && (
          <div className="bg-emerald-950/40 text-emerald-300 text-xs p-3 rounded border border-emerald-800/20 mt-4 leading-normal flex gap-1.5 pt-4 text-left">
            <Check size={15} className="shrink-0 text-emerald-400" />
            <span>{sentSuccessMsg}</span>
          </div>
        )}

        <div className="flex-1 mt-6 space-y-4">
          {/* Subject editable input */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Awaiting AI generation. Choose tone styles and press Generate."
              disabled={isLoading}
              className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg p-3 text-xs text-white focus:border-[#9cf0ff] outline-none font-sans"
            />
          </div>

          {/* Body editable panel */}
          <div className="space-y-1 flex-1 flex flex-col">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">
              Email Body Text
            </label>
            <textarea
              rows={11}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi Sarah,\n\nAwaiting AI copilot parameters..."
              disabled={isLoading}
              className="w-full flex-1 bg-[#0b1326] border border-[#3b494c] rounded-lg p-4 text-xs text-slate-200 placeholder-slate-600 focus:border-[#9cf0ff] outline-none font-sans leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Dynamic tips bar */}
        <div className="h-4 border-t border-[#3b494c]/30 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono mt-4 select-none">
          <span>AI Engine: <b className="text-slate-300">gemini-3.5-flash</b></span>
          <span>Status: Ready to Personalize</span>
        </div>
      </div>
    </div>
  );
};
