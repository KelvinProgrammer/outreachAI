import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';

interface TerminalConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'SYSTEM':
        return 'text-[#4edea3]';
      case 'SUCCESS':
        return 'text-emerald-400 font-bold';
      case 'ERROR':
        return 'text-rose-400 font-semibold';
      case 'QUERY':
        return 'text-[#00daf3]';
      case 'SCRAPE':
        return 'text-[#9cf0ff] italic';
      case 'INFO':
        return 'text-[#9cf0ff]';
      case 'IDLE':
      default:
        return 'text-slate-400';
    }
  };

  return (
    <section className="bg-black rounded-lg border border-[#3b494c] overflow-hidden flex flex-col h-64 shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="bg-[#222a3d] px-4 h-10 flex items-center justify-between border-b border-[#3b494c]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="w-3 h-3 rounded-full bg-[#4edea3]"></span>
          <div className="flex items-center gap-1.5 ml-3">
            <Terminal size={14} className="text-[#bac9cc]" />
            <span className="font-mono text-xs font-semibold text-[#bac9cc]">
              Execution Logging Terminal
            </span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="font-mono text-[11px] text-[#9cf0ff] hover:text-white transition-colors flex items-center gap-1 bg-[#171f33] border border-[#3b494c] px-2 py-0.5 rounded cursor-pointer active:scale-95"
        >
          <Trash2 size={11} />
          Clear Logs
        </button>
      </div>

      {/* Terminal Lines Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 bg-[#060e20] selection:bg-[#00daf3]/30"
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 italic text-center py-8">
            Terminal console cleared. Awaiting logs...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-start select-all leading-normal">
              <span className="text-[#c0c1ff] shrink-0 font-medium select-none">
                [{log.timestamp}]
              </span>
              <div className="text-[#dae2fd] break-all">
                <span className={`mr-2 font-semibold select-none ${getTypeStyle(log.type)}`}>
                  [{log.type}]
                </span>
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
