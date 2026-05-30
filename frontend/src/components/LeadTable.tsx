import React, { useState } from 'react';
import { Search, ExternalLink, Calendar, Trash2, MailPlus, Sparkles, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onDeleteLead: (id: string) => void;
  onSelectLeadForAI: (lead: Lead) => void;
  onAssignToCampaign: (leadId: string, campaignId: string) => void;
  campaigns: { id: string; name: string }[];
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onDeleteLead,
  onSelectLeadForAI,
  onAssignToCampaign,
  campaigns,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortByScore, setSortByScore] = useState<'desc' | 'asc' | null>('desc');

  // Filter & search options
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlatform = platformFilter === 'ALL' || lead.platform === platformFilter;
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    })
    .sort((a, b) => {
      if (sortByScore === 'desc') return b.score - a.score;
      if (sortByScore === 'asc') return a.score - b.score;
      return 0;
    });

  const getPlatformBadgeColor = (platform: Lead['platform']) => {
    switch (platform) {
      case 'LinkedIn':
        return 'bg-[#004f58] text-[#9cf0ff] border border-[#00e5ff]/30';
      case 'Instagram':
        return 'bg-[#00311f] text-[#4edea3] border border-[#00a572]/20';
      case 'Facebook':
        return 'bg-blue-950 text-blue-300 border border-blue-800/30';
      case 'Twitter':
        return 'bg-slate-900 text-slate-300 border border-slate-700/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getStatusBadgeColor = (status: Lead['status']) => {
    switch (status) {
      case 'sent':
      case 'Verified':
        return 'bg-[#003824] text-[#4edea3] border border-[#00a572]/30';
      case 'pending':
      case 'Pending':
        return 'bg-[#222a3d] text-[#bac9cc] border border-[#3b494c]/50';
      case 'generated':
        return 'bg-blue-950 text-[#9cf0ff] border border-blue-800/30';
      case 'failed':
      case 'Bounced':
        return 'bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/20';
      case 'unsubscribed':
      case 'Unverified':
        return 'bg-amber-950/80 text-amber-300 border border-amber-800/20';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const toggleSort = () => {
    setSortByScore((prev) => (prev === 'desc' ? 'asc' : prev === 'asc' ? null : 'desc'));
  };

  return (
    <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-6 shadow-xl space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search leads by name, company..."
            className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-[#9cf0ff] focus:ring-1 focus:ring-[#9cf0ff] outline-none transition-all"
          />
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Platform filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter size={12} className="text-slate-400" />
            <span className="text-slate-400 font-medium">Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-[#0b1326] border border-[#3b494c] rounded px-2.5 py-1 text-xs text-white outline-none cursor-pointer focus:border-[#9cf0ff]"
            >
              <option value="ALL">All Platforms</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter">Twitter</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Verification:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0b1326] border border-[#3b494c] rounded px-2.5 py-1 text-xs text-white outline-none cursor-pointer focus:border-[#9cf0ff]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Unverified">Unverified</option>
              <option value="Bounced">Bounced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-[#dae2fd]">
          <thead>
            <tr className="border-b border-[#3b494c] h-10 text-[11px] font-semibold text-slate-400 select-none uppercase tracking-wider bg-[#131b2e]">
              <th className="py-3 px-4">Lead Name</th>
              <th className="py-3 px-4">Company & Title</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={toggleSort}>
                <div className="flex items-center gap-1">
                  Fit Score
                  {sortByScore === 'desc' ? (
                    <ChevronDown size={14} />
                  ) : sortByScore === 'asc' ? (
                    <ChevronUp size={14} />
                  ) : null}
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3b494c]/40 font-sans">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <p className="font-semibold text-sm">No leads discovered matching filters.</p>
                  <p className="text-xs text-slate-500 mt-1">Start a web-scrape session or broaden search query parameters.</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#222a3d]/50 group transition-colors">
                  {/* Lead Name */}
                  <td className="py-3.5 px-4 font-medium text-white max-w-[150px] truncate">
                    <div>
                      <div className="font-semibold">{lead.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 select-none">
                        <Calendar size={11} />
                        Scraped: {new Date(lead.scrapedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>

                  {/* Company & Title */}
                  <td className="py-3.5 px-4 font-normal">
                    <div className="text-white max-w-[160px] truncate font-semibold">{lead.company}</div>
                    <div className="text-[#bac9cc] max-w-[160px] truncate">{lead.title}</div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 font-mono max-w-[180px] truncate selection:bg-[#00daf3]/20">
                    <div className="flex items-center gap-1 text-slate-300">
                      <span>{lead.email}</span>
                      <a href={`mailto:${lead.email}`} className="text-[#9cf0ff] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4 uppercase font-bold text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full ${getPlatformBadgeColor(lead.platform)}`}>
                      {lead.platform}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 font-bold text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full ${getStatusBadgeColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Fit Score */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${lead.score >= 90 ? 'text-[#secondary]' : 'text-slate-300'}`}>
                        {lead.score}%
                      </span>
                      {/* Interactive visual bullet bar */}
                      <div className="w-12 h-1.5 bg-[#0b1326] border border-[#3b494c] rounded overflow-hidden flex">
                        <div
                          className="h-full bg-linear-to-r from-[#00daf3] to-[#4edea3]"
                          style={{ width: `${lead.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {/* Generate AI email trigger button */}
                      <button
                        onClick={() => onSelectLeadForAI(lead)}
                        className="px-2.5 py-1 text-[11px] bg-[#005236] text-[#6ffbbe] border border-[#4edea3]/40 hover:bg-[#4edea3] hover:text-[#002113] font-semibold rounded transition-all cursor-pointer flex items-center gap-1"
                        title="Draft Personalized Outreach"
                      >
                        <Sparkles size={11} className="text-[#secondary-fixed]" />
                        <span>Copilot</span>
                      </button>

                      {/* Bulk assign sequence list */}
                      {campaigns.length > 0 && (
                        <div className="relative inline-block text-left">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                onAssignToCampaign(lead.id, e.target.value);
                                e.target.value = ''; // Reset select
                              }
                            }}
                            className="bg-[#0b1326] text-slate-300 hover:text-white py-1 px-1.5 border border-[#3b494c] rounded cursor-pointer text-[10px]"
                            title="Add to Campaign"
                          >
                            <option value="">+ Campaign</option>
                            {campaigns.map((camp) => (
                              <option key={camp.id} value={camp.id}>
                                {camp.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats counter footer */}
      <div className="h-4 border-t border-[#3b494c]/30 pt-3 flex justify-between items-center text-[11px] font-mono text-slate-400">
        <div>
          Showing <span className="text-[#9cf0ff]">{filteredLeads.length}</span> of {leads.length} leads
        </div>
        <div className="text-[#4edea3] font-semibold">
          {leads.filter((l) => l.status === 'Verified').length} Verified Vectors Loaded
        </div>
      </div>
    </div>
  );
};
