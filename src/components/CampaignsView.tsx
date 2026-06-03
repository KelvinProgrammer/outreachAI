import React, { useState } from 'react';
import { Mail, Play, Pause, Trash2, Megaphone, Plus, BarChart3, Users, Zap, CheckCircle } from 'lucide-react';
import { Campaign } from '../types';

interface CampaignsViewProps {
  campaigns: Campaign[];
  onToggleCampaign: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
  onLaunchCampaign: (name: string, subject: string, bodyTemplate: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  onToggleCampaign,
  onDeleteCampaign,
  onLaunchCampaign,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [campName, setCampName] = useState('');
  const [campSub, setCampSub] = useState('');
  const [campBody, setCampBody] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !campSub) return;
    onLaunchCampaign(campName, campSub, campBody);
    setCampName('');
    setCampSub('');
    setCampBody('');
    setShowForm(false);
  };

  // Stats summaries
  const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + c.opened, 0);
  const totalReplied = campaigns.reduce((acc, c) => acc + c.replied, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsCount, 0);
  
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Campaign Analytics summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/50 text-[#00daf3] rounded-lg">
            <Megaphone size={18} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE SEQ</div>
            <div className="text-xl font-display font-semibold text-white">
              {campaigns.filter((c) => c.status === 'Active').length}
            </div>
          </div>
        </div>

        <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/50 text-[#4edea3] rounded-lg">
            <Users size={18} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">LEADS PIPELINE</div>
            <div className="text-xl font-display font-semibold text-white">{totalLeads}</div>
          </div>
        </div>

        <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-violet-950/50 text-[#c0c1ff] rounded-lg">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">AVG OPEN RATE</div>
            <div className="text-xl font-display font-semibold text-white">{openRate}%</div>
          </div>
        </div>

        <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-rose-950/50 text-rose-300 rounded-lg">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">REPLY CONV</div>
            <div className="text-xl font-display font-semibold text-white">{replyRate}%</div>
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-8 text-center text-slate-400 space-y-4">
          <Mail size={32} className="mx-auto text-slate-500" />
          <h3 className="text-base font-semibold text-white">No active marketing sequences</h3>
          <p className="text-xs max-w-sm mx-auto">
            Create an automated email/social outbound marketing sequence to nurture and invite hot leads.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#4edea3] text-[#003824] hover:bg-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1 mx-auto cursor-pointer"
          >
            <Plus size={14} /> Create Outreach Campaign
          </button>
        </div>
      ) : (
        <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-6.5 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-[#9cf0ff]" size={18} />
              <h3 className="font-display font-semibold text-white text-base">Inbound Sequences</h3>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-1.5 bg-[#171f33] text-xs hover:text-white border border-[#3b494c] hover:border-[#00daf3]/55 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={14} /> {showForm ? 'Close Form' : 'New Campaign'}
            </button>
          </div>

          {/* Quick-create container */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-[#0b1326] p-4 rounded-lg border border-[#3b494c] space-y-4 font-sans select-none">
              <h4 className="text-xs font-mono uppercase text-[#00daf3] tracking-widest font-semibold">Launch Outbound Sequence</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Campaign Title Name</label>
                  <input
                    type="text"
                    required
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    placeholder="e.g. CMO Outreach sequence"
                    className="w-full bg-[#171f33] border border-[#3b494c] rounded p-2.5 text-xs text-white outline-none focus:border-[#9cf0ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Default Email Subject</label>
                  <input
                    type="text"
                    required
                    value={campSub}
                    onChange={(e) => setCampSub(e.target.value)}
                    placeholder="Subject line"
                    className="w-full bg-[#171f33] border border-[#3b494c] rounded p-2.5 text-xs text-white outline-none focus:border-[#9cf0ff]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Sequence Body Content (Supports {`{name}`} placeholder)</label>
                <textarea
                  rows={4}
                  value={campBody}
                  onChange={(e) => setCampBody(e.target.value)}
                  placeholder="Hey {name}, notived your profile on OutreachAI... "
                  className="w-full bg-[#171f33] border border-[#3b494c] rounded p-2.5 text-xs text-white outline-none focus:border-[#9cf0ff]"
                />
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#4edea3] text-[#003824] hover:bg-emerald-400 rounded cursor-pointer"
                >
                  Confirm & Initialize Campaign
                </button>
              </div>
            </form>
          )}

          {/* campaigns list */}
          <div className="divide-y divide-[#3b494c]/30 font-sans">
            {campaigns.map((c) => {
              const currentOpenRate = c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0;
              const currentReplyRate = c.sent > 0 ? Math.round((c.replied / c.sent) * 100) : 0;

              return (
                <div key={c.id} className="py-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{c.name}</span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                          c.status === 'Active'
                            ? 'bg-[#003824] text-[#4edea3] border border-[#00a572]/20'
                            : c.status === 'Paused'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/10'
                            : 'bg-[#222a3d] text-slate-400 border border-[#3b494c]/50'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4">
                      <span>Pipeline: <b className="text-white font-medium">{c.leadsCount} prospects assigned</b></span>
                      <span>Created: <b className="text-slate-300 font-normal">{new Date(c.createdAt).toLocaleDateString()}</b></span>
                      <span className="max-w-[200px] truncate text-slate-400">Subject: "{c.subject}"</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8 w-full md:w-auto">
                    {/* campaign counters */}
                    <div className="flex gap-4.5 font-mono text-center">
                      <div className="px-1.5">
                        <div className="text-[9px] text-[#bac9cc] uppercase mb-0.5">SENT</div>
                        <div className="text-xs font-bold text-white">{c.sent}</div>
                      </div>
                      <div className="px-1.5">
                        <div className="text-[9px] text-[#00daf3] uppercase mb-0.5">OPEN RATE</div>
                        <div className="text-xs font-bold text-[#9cf0ff]">{currentOpenRate}%</div>
                      </div>
                      <div className="px-1.5">
                        <div className="text-[9px] text-[#secondary-fixed] uppercase mb-0.5">REPLIED</div>
                        <div className="text-xs font-bold text-[#4edea3]">{currentReplyRate}%</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => onToggleCampaign(c.id)}
                        className={`p-1.5 border rounded cursor-pointer transition-colors ${
                          c.status === 'Active'
                            ? 'bg-amber-950/20 text-amber-400 border-amber-800/20 hover:bg-amber-400 hover:text-slate-900'
                            : 'bg-emerald-950/20 text-emerald-400 border-emerald-800/20 hover:bg-emerald-400 hover:text-slate-900'
                        }`}
                        title={c.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'}
                      >
                        {c.status === 'Active' ? <Pause size={12} /> : <Play size={12} />}
                      </button>

                      <button
                        onClick={() => onDeleteCampaign(c.id)}
                        className="p-1.5 bg-rose-950/20 text-rose-400 border border-thin border-rose-800/20 hover:bg-rose-500 hover:text-white rounded cursor-pointer transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
