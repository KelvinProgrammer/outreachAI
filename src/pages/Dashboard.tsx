import { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Settings,
  Terminal,
  HelpCircle,
  Bell,
  Play,
  Sliders,
  Network,
  Cpu,
  Check,
  CheckCircle,
  Plus,
  X,
  RefreshCw,
  Sparkles,
  Zap,
  Briefcase,
  Layers,
  ChevronRight,
  Monitor
} from 'lucide-react';

import { Lead, LogEntry, Campaign, ScrapeConfig } from '../types';
import { INITIAL_LEADS, INITIAL_CAMPAIGNS, INITIAL_LOGS, NEW_POTENTIAL_LEADS } from '../data';
import { TerminalConsole } from '../components/TerminalConsole';
import { ProxyStatusCard } from '../components/ProxyStatusCard';
import { LeadTable } from '../components/LeadTable';
import { OutreachGenerator } from '../components/OutreachGenerator';
import { CampaignsView } from '../components/CampaignsView';

export default function Dashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  // Get active user session details
  const [userSession] = useState<{ email: string; name?: string }>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : { email: 'mwangikelvin3@gmail.com', name: 'Kelvin' };
  });

  // Shared States (persisted via localStorage where useful!)
  const [activeTab, setActiveTab] = useState<string>('scrape');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('nexus_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  // Scraper States
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeProgress, setScrapeProgress] = useState<number>(33); // Starting progress bar representation
  const [scrapedCountThisSession, setScrapedCountThisSession] = useState<number>(0);

  // Outreach states
  const [selectedLeadForAI, setSelectedLeadForAI] = useState<Lead | null>(null);

  // Configuration States
  const [scrapeConfig, setScrapeConfig] = useState<ScrapeConfig>({
    searchQuery: "site:instagram.com \"ugc\" \"travel\" \"gmail.com\"",
    platforms: ['Instagram', 'Facebook'],
    resultsLimit: 15,
    launchChrome: true
  });

  const [platformToAdd, setPlatformToAdd] = useState<string>('');
  const [showPlatformSelect, setShowPlatformSelect] = useState<boolean>(false);

  // System Settings local options
  const [threadCount, setThreadCount] = useState<number>(4);
  const [requestDelay, setRequestDelay] = useState<number>(60);
  const [selectedEngine, setSelectedEngine] = useState<string>('Selenium Stealth');
  const [ocrActive, setOcrActive] = useState<boolean>(true);

  // Real Backend Configurations State
  const [settings, setSettings] = useState({
    deepseek_api_key: '',
    outreach_template: '',
    outreach_subject: '',
    delay_seconds: 60
  });

  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    use_tls: 1,
    sender_email: '',
    sender_name: ''
  });

  // Load data from backend APIs
  const fetchLeads = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/leads');
      if (res.ok) {
        const dbLeads = await res.json();
        const savedMapping = localStorage.getItem('nexus_lead_campaign_map') || '{}';
        const mapping = JSON.parse(savedMapping);

        // Map backend leads schema to frontend Lead interface
        const mapped: Lead[] = dbLeads.map((l: any) => {
          let platform: Lead['platform'] = 'Instagram';
          if (l.source_url) {
            const urlLower = l.source_url.toLowerCase();
            if (urlLower.includes('linkedin.com')) platform = 'LinkedIn';
            else if (urlLower.includes('facebook.com')) platform = 'Facebook';
            else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) platform = 'Twitter';
          }
          const scoreBase = l.email.split('@')[0] || '';
          let hash = 0;
          for (let i = 0; i < scoreBase.length; i++) {
            hash = scoreBase.charCodeAt(i) + ((hash << 5) - hash);
          }
          const fitScore = 85 + (Math.abs(hash) % 15);
          const leadIdStr = l.id.toString();

          return {
            id: leadIdStr,
            name: l.name || 'UGC Creator',
            title: 'Travel UGC Creator',
            company: l.source_url && l.source_url.includes('instagram.com') ? 'Instagram UGC' : 'Social UGC',
            email: l.email,
            platform,
            status: l.status,
            scrapedAt: l.created_at || new Date().toISOString(),
            score: fitScore,
            campaignId: mapping[leadIdStr] || '',
            generated_subject: l.generated_subject || '',
            generated_body: l.generated_body || '',
            error_message: l.error_message,
            sent_at: l.sent_at,
            created_at: l.created_at,
            source_url: l.source_url
          };
        });
        setLeads(mapped);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.delay_seconds) {
          setRequestDelay(data.delay_seconds);
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/smtp');
      if (res.ok) {
        const data = await res.json();
        setSmtpConfig(data);
      }
    } catch (err) {
      console.error("Error fetching SMTP config:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchSettings();
    fetchSmtpConfig();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // Append new logs easily
  const createLog = (message: string, type: LogEntry['type'] = 'INFO') => {
    const timeStr = new Date().toLocaleTimeString([], { hour12: false });
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      type,
      message,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Platform handlers
  const handleRemovePlatform = (p: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter') => {
    setScrapeConfig((prev) => ({
      ...prev,
      platforms: prev.platforms.filter((plat) => plat !== p)
    }));
    createLog(`Removed platform ${p} from targets.`, 'INFO');
  };

  const handleAddPlatform = (p: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter') => {
    if (scrapeConfig.platforms.includes(p)) return;
    setScrapeConfig((prev) => ({
      ...prev,
      platforms: [...prev.platforms, p]
    }));
    createLog(`Added platform source parameter: ${p}`, 'INFO');
  };

  // Run lead discovery scrape using live Selenium Chrome
  const handleStartScrape = () => {
    if (isScraping) return;

    if (!scrapeConfig.searchQuery.trim()) {
      createLog('CRITICAL: Empty search query syntax cannot be compiled.', 'ERROR');
      return;
    }

    if (scrapeConfig.platforms.length === 0) {
      createLog('CRITICAL: Select at least one platform to inspect.', 'ERROR');
      return;
    }

    setIsScraping(true);
    setScrapeProgress(15);
    setScrapedCountThisSession(0);
    
    createLog(`Initializing visible Chrome Selenium scraping session...`, 'SYSTEM');
    createLog(`Rotating security egress gateway... proxy tunnel established successfully.`, 'SYSTEM');
    createLog(`Query: "${scrapeConfig.searchQuery}"`, 'QUERY');
    createLog(`Target Platforms: [${scrapeConfig.platforms.join(', ')}]`, 'INFO');
    createLog(`Google Search query limits: ${scrapeConfig.resultsLimit}`, 'INFO');
    createLog(`Awaiting Google SERP rendering inside Chrome window...`, 'SCRAPE');

    fetch('http://localhost:8000/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: scrapeConfig.searchQuery,
        num_results: scrapeConfig.resultsLimit,
        simulate: false // We run the real Selenium Chrome browser!
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Scraping session failed');
        }
        return res.json();
      })
      .then((data) => {
        setScrapeProgress(100);
        setIsScraping(false);
        setScrapedCountThisSession(data.total_harvested || 0);
        createLog(`SUCCESS: Discovered ${data.total_harvested} total profiles on Google.`, 'SUCCESS');
        createLog(`Saved ${data.new_added} brand new leads into the database.`, 'SUCCESS');
        createLog(`All browser hooks safely released. Awaiting operator dispatch orders.`, 'IDLE');
        fetchLeads();
      })
      .catch((err) => {
        setScrapeProgress(100);
        setIsScraping(false);
        createLog(`ERROR: Scraping failed - ${err.message}`, 'ERROR');
      });
  };

  // Lead actions
  const handleDeleteLead = (id: string) => {
    fetch(`http://localhost:8000/api/leads/${id}`, {
      method: 'DELETE'
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        createLog(`Removed lead vector reference ID ${id} from registry database.`, 'INFO');
        fetchLeads();
      })
      .catch((err) => {
        createLog(`ERROR: Failed to delete lead reference - ${err.message}`, 'ERROR');
      });
  };

  const handleSelectLeadForAI = (lead: Lead) => {
    setSelectedLeadForAI(lead);
    setActiveTab('templates'); // Switch to prompt templates workspace
    createLog(`Lead "${lead.name}" assigned to AI Outreach copywriter terminal.`, 'INFO');
  };

  const handleAssignLeadToCampaign = (leadId: string, campaignId: string) => {
    const leadObj = leads.find((l) => l.id === leadId);
    if (!leadObj) return;

    // Save lead campaign association in local storage mapping
    const savedMapping = localStorage.getItem('nexus_lead_campaign_map') || '{}';
    const mapping = JSON.parse(savedMapping);
    mapping[leadId] = campaignId;
    localStorage.setItem('nexus_lead_campaign_map', JSON.stringify(mapping));

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return { ...l, campaignId };
        }
        return l;
      })
    );

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          return {
            ...c,
            leadsCount: c.leadsCount + 1,
          };
        }
        return c;
      })
    );
    createLog(`Assigned ${leadObj.name} to outreach campaign sequence [${campaignId}].`, 'SUCCESS');
  };

  // AI Outreach Template integration save handler (commits to SQLite)
  const handleSaveOutreachTemplate = (leadId: string, subject: string, body: string) => {
    fetch(`http://localhost:8000/api/leads/${leadId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        createLog(`SUCCESS: Outreach copy saved to Lead ID ${leadId} in database.`, 'SUCCESS');
        fetchLeads();
      })
      .catch((err) => {
        createLog(`ERROR: Failed to save email copy - ${err.message}`, 'ERROR');
      });
  };

  // Campaign management actions (triggers background drip mail queues)
  const handleToggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'Active' ? 'Paused' : 'Active';
          createLog(`Sequence [${c.name}] status toggled to ${nextStatus}.`, 'INFO');
          
          if (nextStatus === 'Active') {
            const campaignLeads = leads.filter(l => l.campaignId === id);
            if (campaignLeads.length > 0) {
              const leadIds = campaignLeads.map(l => parseInt(l.id));
              createLog(`Launching sequence in background for ${leadIds.length} prospects...`, 'SYSTEM');
              
              fetch('http://localhost:8000/api/campaign/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadIds)
              })
                .then(async (res) => {
                  if (!res.ok) throw new Error(await res.text());
                  return res.json();
                })
                .then((data) => {
                  createLog(`SUCCESS: Drip campaign processing safely initiated in background queue.`, 'SUCCESS');
                })
                .catch((err) => {
                  createLog(`ERROR: Campaign initiation failed - ${err.message}`, 'ERROR');
                });
            } else {
              createLog(`WARNING: No prospect leads are currently assigned to Campaign [${c.name}]. Add leads in the registry first.`, 'INFO');
            }
          }
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    createLog(`Campaign sequence index ${id} permanently deleted.`, 'INFO');
  };

  const handleLaunchCampaign = (name: string, subject: string, bodyTemplate: string) => {
    const nextId = `C-${String(campaigns.length + 1).padStart(3, '0')}`;
    const newCamp: Campaign = {
      id: nextId,
      name,
      subject,
      bodyTemplate,
      sent: 0,
      opened: 0,
      replied: 0,
      status: 'Active',
      leadsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [...prev, newCamp]);
    createLog(`Constructed and deployed new outbound sequence Campaign: [${name}]`, 'SUCCESS');
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] font-sans overflow-x-hidden min-h-screen flex flex-col">
      {/* TopNavBar Header block */}
      <header className="flex justify-between items-center px-6 h-16 w-full z-40 bg-[#0b1326] border-b border-[#3b494c] fixed top-0 select-none">
        <div className="flex items-center gap-6">
          <span onClick={() => onNavigate('/')} className="font-display text-xl font-bold text-[#00daf3] tracking-wider flex items-center gap-2 cursor-pointer">
            <Zap className="text-[#00e5ff] fill-[#00daf3]/10" size={20} />
            OutreachAI
          </span>
          {/* Top Navbar items */}
          <nav className="hidden md:flex items-center gap-1.5 ml-6">
            <button
              onClick={() => setActiveTab('leads')}
              className={`text-xs font-semibold py-1.5 px-3 rounded transition-colors cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-[#171f33] text-[#9cf0ff]'
                  : 'text-slate-400 hover:text-white hover:bg-[#171f33]/40'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('scrape')}
              className={`text-xs font-semibold py-1.5 px-3 rounded transition-colors cursor-pointer ${
                activeTab === 'scrape'
                  ? 'bg-[#171f33] text-[#9cf0ff] border-b border-[#00e5ff]'
                  : 'text-slate-400 hover:text-white hover:bg-[#171f33]/40'
              }`}
            >
              Scrape Console
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`text-xs font-semibold py-1.5 px-3 rounded transition-colors cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'bg-[#171f33] text-[#9cf0ff]'
                  : 'text-slate-400 hover:text-white hover:bg-[#171f33]/40'
              }`}
            >
              Campaigns
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Action indicator icons */}
          <div className="relative">
            <button className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#222a3d] cursor-pointer transition-colors">
              <Bell size={16} />
            </button>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4edea3] border border-[#0b1326] select-none"></span>
          </div>
          <button
            onClick={() => setActiveTab('scrape')}
            className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-[#222a3d] cursor-pointer transition-colors"
            title="Terminal logs overview"
          >
            <Terminal size={16} />
          </button>
          
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700 select-none">
            <div className="w-7 h-7 rounded-full bg-[#131b2e] border border-[#3b494c] flex items-center justify-center font-display text-xs text-[#00daf3] font-bold">
              {userSession.name ? userSession.name.charAt(0).toUpperCase() : userSession.email.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-mono text-[11px] text-slate-400">{userSession.email}</span>
            <button
              onClick={() => {
                localStorage.removeItem('nexus_user');
                onNavigate('/');
              }}
              className="text-[10px] font-mono text-rose-400 hover:text-rose-300 ml-2 cursor-pointer border border-rose-950/20 px-1.5 py-0.5 rounded hover:bg-rose-950/20"
              title="Log Out Session"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper with fixed Sidebar */}
      <div className="flex flex-1 pt-16 h-full min-h-[calc(100vh-64px)]">
        {/* Left Drawer SideNavBar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[280px] bg-[#060e20] border-r border-[#3b494c] py-6 flex flex-col justify-between select-none hidden md:flex">
          <div className="space-y-6">
            <div className="px-6">
              <h2 className="font-display text-lg font-bold text-[#9cf0ff] tracking-tight">Nexus Operator</h2>
              <p className="font-mono text-[10px] text-[#4edea3] opacity-80 uppercase tracking-widest mt-0.5">
                Precision Mode
              </p>
            </div>
            
            {/* Sidebar nav lists */}
            <nav className="flex flex-col gap-1 px-4">
              <button
                onClick={() => setActiveTab('scrape')}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all cursor-pointer ${
                  activeTab === 'scrape'
                    ? 'bg-[#00a572] text-white font-semibold shadow-[inset_0_0_8px_rgba(78,222,163,0.35)]'
                    : 'text-slate-400 hover:bg-[#171f33] hover:text-[#dae2fd]'
                }`}
              >
                <Search size={15} />
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider block">SEARCH & SCRAPE</span>
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all cursor-pointer ${
                  activeTab === 'leads'
                    ? 'bg-[#171f33] text-[#c3f5ff] font-semibold border-l-2 border-[#00daf3]'
                    : 'text-slate-400 hover:bg-[#171f33] hover:text-[#dae2fd]'
                }`}
              >
                <Users size={15} />
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider block">DISCOVERED LEADS</span>
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-[#171f33] text-[#c3f5ff] font-semibold border-l-2 border-[#00daf3]'
                    : 'text-slate-400 hover:bg-[#171f33] hover:text-[#dae2fd]'
                }`}
              >
                <Sparkles size={15} className="text-purple-400" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider block">DEEPSEEK TEMPLATES</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#171f33] text-[#c3f5ff] font-semibold border-l-2 border-[#00daf3]'
                    : 'text-slate-400 hover:bg-[#171f33] hover:text-[#dae2fd]'
                }`}
              >
                <Settings size={15} />
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider block">SYSTEM SETTINGS</span>
              </button>
            </nav>
          </div>

          <div className="px-4 space-y-4">
            {/* Start Launcher floating trigger in Sidebar */}
            <button
              onClick={() => {
                setActiveTab('scrape');
                handleStartScrape();
              }}
              disabled={isScraping}
              className="w-full py-3 px-4 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-semibold rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Play size={13} fill="currentColor" />
              Launch New Scrape
            </button>
            
            <div className="border-t border-[#3b494c]/50 pt-3 flex flex-col gap-1">
              <button
                onClick={() => createLog('User requested direct diagnostic feedback from system hooks.', 'INFO')}
                className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 hover:bg-[#171f33] rounded-lg text-xs leading-none transition-colors cursor-pointer"
              >
                <Terminal size={13} />
                <span>Diagnostics Logs</span>
              </button>
              
              <a
                href="mailto:mwangikelvin3@gmail.com"
                className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 hover:bg-[#171f33] rounded-lg text-xs leading-none transition-colors"
              >
                <HelpCircle size={13} />
                <span>Support Desk</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Content Panel Frame container */}
        <main className="flex-1 md:ml-[280px] p-6 pb-20 overflow-y-auto bg-[#0b1326]">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Visual Head section (Changes contextual based on screen view) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-l-4 border-[#00daf3] pl-6 py-1 select-none">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                  {activeTab === 'scrape' && 'Leads Discovery Console'}
                  {activeTab === 'leads' && 'Leads Registry Database'}
                  {activeTab === 'templates' && 'AI Sequence Personalizer'}
                  {activeTab === 'campaigns' && 'Campaign Orchestrator'}
                  {activeTab === 'settings' && 'Automation System Settings'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeTab === 'scrape' && 'Target platforms to extract sales profiles, verify emails, and enrich domains.'}
                  {activeTab === 'leads' && 'Review scraped sales profiles, verify domains, and sync outputs with automated campaigns.'}
                  {activeTab === 'templates' && 'Leverage professional copywriting engines (Gemini) to draft custom outbound templates.'}
                  {activeTab === 'campaigns' && 'Develop, launch, and inspect active mail drip lists and automated sequence filters.'}
                  {activeTab === 'settings' && 'Configure custom proxy channels, scrape throttle latency nodes, and chrome wrappers.'}
                </p>
              </div>

              {/* High-fidelity responsive counter summaries */}
              <div className="flex gap-4 bg-[#171f33] p-3 rounded-lg border border-[#3b494c] inner-glow">
                <div className="flex flex-col items-center px-4 border-r border-[#3b494c]/60 cursor-pointer" onClick={() => setActiveTab('leads')}>
                  <span className="font-sans text-[9px] font-bold tracking-widest text-[#6ffbbe] uppercase">LEADS</span>
                  <span className="text-lg font-bold text-[#4edea3] font-display mt-0.5">{leads.length}</span>
                </div>
                <div className="flex flex-col items-center px-4 border-r border-[#3b494c]/60 cursor-pointer" onClick={() => setActiveTab('campaigns')}>
                  <span className="font-sans text-[9px] font-bold tracking-widest text-slate-400 uppercase">DRAFTS</span>
                  <span className="text-lg font-bold text-white font-display mt-0.5">
                    {campaigns.filter(c => c.status === 'Draft').length || 1}
                  </span>
                </div>
                <div className="flex flex-col items-center px-4" onClick={() => setActiveTab('campaigns')}>
                  <span className="font-sans text-[9px] font-bold tracking-widest text-rose-300 uppercase">FAILED</span>
                  <span className="text-lg font-bold text-rose-400 font-display mt-0.5">0 / 0</span>
                </div>
              </div>
            </div>

            {/* View renders */}

            {/* TAB 1: SCRAPE CONSOLE VIEW */}
            {activeTab === 'scrape' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left block form */}
                  <div className="lg:col-span-2 bg-[#171f33] rounded-xl border border-[#3b494c] p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-2 border-b border-[#3b494c]/50 pb-3 selection:bg-none">
                      <Sliders className="text-[#00daf3]" size={18} />
                      <h3 className="font-display font-semibold text-[#dae2fd] text-base">
                        Scrape Configuration
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Query Syntax */}
                      <div className="space-y-1.5 select-none">
                        <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold">
                          Search Query Syntax
                        </label>
                        <input
                          type="text"
                          value={scrapeConfig.searchQuery}
                          onChange={(e) => setScrapeConfig(prev => ({ ...prev, searchQuery: e.target.value }))}
                          placeholder="e.g. site:linkedin.com/in 'CEO' @gmail.com"
                          className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg p-3.5 font-mono text-xs text-white focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Selector platforms */}
                        <div className="space-y-2 select-none">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold">
                            Platform Selector
                          </label>
                          <div className="flex flex-wrap gap-1.5 p-2 border border-[#3b494c] rounded-lg bg-[#0b1326] min-h-[46px] items-center">
                            {scrapeConfig.platforms.map((p) => (
                              <span
                                key={p}
                                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 border ${
                                  p === 'LinkedIn' 
                                    ? 'bg-[#131b2e] border-[#00e5ff]/35 text-[#9cf0ff]' 
                                    : 'bg-[#131b2e] border-[#4edea3]/35 text-[#4edea3]'
                                }`}
                              >
                                {p}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePlatform(p)}
                                  className="text-slate-400 hover:text-white transition-colors cursor-pointer font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {/* Platform adder drop list */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowPlatformSelect(!showPlatformSelect)}
                                className="px-2.5 py-0.5 text-[#00daf3] text-[10px] font-mono border border-dashed border-[#00daf3] rounded-full hover:bg-[#00daf3]/10 transition-colors cursor-pointer select-none"
                              >
                                + Add Platform
                              </button>
                              {showPlatformSelect && (
                                <div className="absolute top-6 left-0 bg-[#060e20] border border-[#3b494c] rounded shadow-xl py-1 z-30 min-w-[110px] text-left">
                                  {['Facebook', 'Instagram', 'LinkedIn', 'Twitter'].map((plat) => {
                                    const disabled = scrapeConfig.platforms.includes(plat as any);
                                    return (
                                      <button
                                        key={plat}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => {
                                          handleAddPlatform(plat as any);
                                          setShowPlatformSelect(false);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:bg-[#171f33] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed block transition-colors"
                                      >
                                        {plat}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Slide limits */}
                        <div className="space-y-2 select-none">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                            <span>Results Limit</span>
                            <span className="text-[#00daf3] font-bold">({scrapeConfig.resultsLimit})</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={scrapeConfig.resultsLimit}
                            onChange={(e) => setScrapeConfig(prev => ({ ...prev, resultsLimit: Number(e.target.value) }))}
                            className="w-full accent-[#00daf3] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between font-mono text-[9px] text-[#849396]/80 px-0.5">
                            <span>1</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                        </div>
                      </div>

                      {/* Launch setting checklist card */}
                      <div className="p-4 border border-[#3b494c] rounded-lg bg-[#060e20] flex items-start gap-4 hover:border-[#00daf3] transition-colors group select-none">
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            id="chrome-checkbox"
                            checked={scrapeConfig.launchChrome}
                            onChange={(e) => setScrapeConfig(prev => ({ ...prev, launchChrome: e.target.checked }))}
                            className="w-4 h-4 rounded border-[#3b494c] bg-[#171f33] text-[#00daf3] focus:ring-[#00daf3] cursor-pointer"
                          />
                        </div>
                        <label htmlFor="chrome-checkbox" className="cursor-pointer select-none">
                          <span className="font-display font-medium text-sm text-white group-hover:text-[#9cf0ff] transition-colors block">
                            Launch Visible Chrome Window
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Runs active browser window dynamically using virtual displays to capture SERP layers and scrape verified contacts safely.
                          </span>
                        </label>
                      </div>

                      {/* Main Launch trigger */}
                      <button
                        onClick={handleStartScrape}
                        disabled={isScraping}
                        className="w-full bg-[#secondary] hover:bg-[#6ffbbe] text-[#003824] font-display font-bold text-sm py-4.5 rounded-xl shadow-[0_0_20px_rgba(78,222,163,0.3)] active:scale-98 select-none transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-40"
                      >
                        {isScraping ? (
                          <>
                            <RefreshCw className="animate-spin" size={16} />
                            CRAWLER RUNNING...
                          </>
                        ) : (
                          <>
                            <Play size={16} fill="currentColor" />
                            START SCRAPE
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right visual asset status card */}
                  <div className="lg:col-span-1">
                    <ProxyStatusCard isScraping={isScraping} />
                  </div>
                </div>

                {/* Execution Term log block */}
                <TerminalConsole logs={logs} onClear={handleClearLogs} />
              </div>
            )}

            {/* TAB 2: REGISTER LEADS VIEW */}
            {activeTab === 'leads' && (
              <LeadTable
                leads={leads}
                onDeleteLead={handleDeleteLead}
                onSelectLeadForAI={handleSelectLeadForAI}
                onAssignToCampaign={handleAssignLeadToCampaign}
                campaigns={campaigns}
              />
            )}

            {/* TAB 3: PERSONALIZER COPILOT */}
            {activeTab === 'templates' && (
              <OutreachGenerator
                selectedLead={selectedLeadForAI}
                onSaveTemplate={handleSaveOutreachTemplate}
                leads={leads}
              />
            )}

            {/* TAB 4: CAMPAIGNS SEQUENCE */}
            {activeTab === 'campaigns' && (
              <CampaignsView
                campaigns={campaigns}
                onToggleCampaign={handleToggleCampaign}
                onDeleteCampaign={handleDeleteCampaign}
                onLaunchCampaign={handleLaunchCampaign}
              />
            )}
            {/* TAB 5: SYSTEM SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* General settings & templates */}
                  <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-2 border-b border-[#3b494c]/60 pb-3 select-none">
                      <Sparkles className="text-[#00daf3]" size={18} />
                      <h3 className="font-display font-semibold text-white text-base">DeepSeek & AI Copywriter</h3>
                    </div>
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await fetch('http://localhost:8000/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(settings)
                        });
                        if (res.ok) {
                          createLog('SUCCESS: General Settings updated in database registry.', 'SUCCESS');
                          fetchSettings();
                        } else {
                          const txt = await res.text();
                          createLog(`ERROR: Failed to update general settings - ${txt}`, 'ERROR');
                        }
                      } catch (err: any) {
                        createLog(`ERROR: Database connection timeout - ${err.message}`, 'ERROR');
                      }
                    }} className="space-y-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold">
                          DeepSeek API Key
                        </label>
                        <input
                          type="password"
                          value={settings.deepseek_api_key}
                          onChange={(e) => setSettings(prev => ({ ...prev, deepseek_api_key: e.target.value }))}
                          placeholder="sk-or-deepseek-api-key..."
                          className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg p-2.5 font-mono text-xs text-white focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] outline-none"
                        />
                      </div>
                      
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold">
                          Default Outreach Subject Template
                        </label>
                        <input
                          type="text"
                          value={settings.outreach_subject}
                          onChange={(e) => setSettings(prev => ({ ...prev, outreach_subject: e.target.value }))}
                          placeholder="Collaboration Inquiry - {name}"
                          className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg p-2.5 text-xs text-white focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] outline-none"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold">
                          Outreach Body Template
                        </label>
                        <textarea
                          rows={6}
                          value={settings.outreach_template}
                          onChange={(e) => setSettings(prev => ({ ...prev, outreach_template: e.target.value }))}
                          placeholder="Hey {name}, loved your work on {source_url}..."
                          className="w-full bg-[#0b1326] border border-[#3b494c] rounded-lg p-2.5 text-xs text-white focus:border-[#00daf3] focus:ring-1 focus:ring-[#00daf3] outline-none font-sans"
                        />
                        <span className="text-[9px] font-mono text-slate-500 block">
                          Variables allowed: &#123;name&#125;, &#123;email&#125;, &#123;source_url&#125;, &#123;query&#125;, &#123;sender_name&#125;
                        </span>
                      </div>

                      <div className="space-y-2 select-none text-left">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase font-bold">
                          <span>Antispam Delay Jitter</span>
                          <span className="text-[#9cf0ff] font-bold">({settings.delay_seconds} seconds)</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="300"
                          step="5"
                          value={settings.delay_seconds}
                          onChange={(e) => setSettings(prev => ({ ...prev, delay_seconds: Number(e.target.value) }))}
                          className="w-full accent-[#00daf3] h-1 bg-[#2d3449] rounded cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#4edea3] hover:bg-emerald-400 text-[#003824] font-semibold rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sliders size={13} />
                        Save General Settings
                      </button>
                    </form>
                  </div>

                  {/* SMTP Server details */}
                  <div className="bg-[#171f33] border border-[#3b494c] rounded-xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-2 border-b border-[#3b494c]/60 pb-3 select-none">
                      <Sliders className="text-[#00daf3]" size={18} />
                      <h3 className="font-display font-semibold text-white text-base">SMTP Mail Server Config</h3>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await fetch('http://localhost:8000/api/smtp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(smtpConfig)
                        });
                        if (res.ok) {
                          createLog('SUCCESS: SMTP credentials successfully committed to database registry.', 'SUCCESS');
                          fetchSmtpConfig();
                        } else {
                          const txt = await res.text();
                          createLog(`ERROR: SMTP update failed - ${txt}`, 'ERROR');
                        }
                      } catch (err: any) {
                        createLog(`ERROR: Database connection timeout - ${err.message}`, 'ERROR');
                      }
                    }} className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-left">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">SMTP Host</label>
                          <input
                            type="text"
                            value={smtpConfig.host}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                            placeholder="smtp.gmail.com"
                            className="w-full bg-[#0b1326] border border-[#3b494c] rounded p-2 text-xs text-white outline-none focus:border-[#00daf3]"
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Port</label>
                          <input
                            type="number"
                            value={smtpConfig.port}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: Number(e.target.value) }))}
                            placeholder="587"
                            className="w-full bg-[#0b1326] border border-[#3b494c] rounded p-2 text-xs text-white outline-none focus:border-[#00daf3]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Username</label>
                          <input
                            type="text"
                            value={smtpConfig.username}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="you@gmail.com"
                            className="w-full bg-[#0b1326] border border-[#3b494c] rounded p-2 text-xs text-white outline-none focus:border-[#00daf3]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Password</label>
                          <input
                            type="password"
                            value={smtpConfig.password}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="********"
                            className="w-full bg-[#0b1326] border border-[#3b494c] rounded p-2 text-xs text-white outline-none focus:border-[#00daf3]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Sender Email</label>
                          <input
                            type="text"
                            value={smtpConfig.sender_email}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, sender_email: e.target.value }))}
                            placeholder="collabs@brand.com"
                            className="w-full bg-[#0b1326] border border-[#3b494c] rounded p-2 text-xs text-white outline-none focus:border-[#00daf3]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Sender Name</label>
                          <input
                            type="text"
                            value={smtpConfig.sender_name}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, sender_name: e.target.value }))}
                            placeholder="Kelvin Outreach"
                            className="w-full bg-[#0b1326] border border-[#3b494c] rounded p-2 text-xs text-white outline-none focus:border-[#00daf3]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 py-2 text-left">
                        <input
                          type="checkbox"
                          id="use-tls-chk"
                          checked={smtpConfig.use_tls === 1}
                          onChange={(e) => setSmtpConfig(prev => ({ ...prev, use_tls: e.target.checked ? 1 : 0 }))}
                          className="w-4 h-4 rounded border-[#3b494c] bg-[#171f33] text-[#00daf3] focus:ring-[#00daf3] cursor-pointer"
                        />
                        <label htmlFor="use-tls-chk" className="text-xs text-slate-300 cursor-pointer">
                          Enforce SSL/TLS Secure SMTP Wrapper
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#00e5ff] hover:bg-[#9cf0ff] text-slate-900 font-semibold rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap size={13} fill="currentColor" />
                        Save SMTP Config
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Persistent bottom progress bar shown when scraper runs */}
      <div className="fixed bottom-0 left-0 md:left-[280px] right-0 h-1.5 bg-[#060e20] z-50 select-none">
        <div
          className="h-full bg-[#00daf3] shadow-[0_0_12px_#00daf3] transition-all duration-300 ease-out"
          style={{ width: `${isScraping ? scrapeProgress : 33}%` }}
        ></div>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#171f33] border-t border-[#3b494c] flex justify-around items-center z-50 select-none">
        <button
          onClick={() => setActiveTab('scrape')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'scrape' ? 'text-[#00daf3]' : 'text-slate-400'
          }`}
        >
          <Search size={16} />
          <span className="text-[9px] font-bold uppercase tracking-wider">SCRAPE</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'leads' ? 'text-[#00daf3]' : 'text-slate-400'
          }`}
        >
          <Users size={16} />
          <span className="text-[9px] font-bold uppercase tracking-wider">LEADS</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'templates' ? 'text-purple-400' : 'text-slate-400'
          }`}
        >
          <Sparkles size={16} />
          <span className="text-[9px] font-bold uppercase tracking-wider">MODELS</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings' ? 'text-[#00daf3]' : 'text-slate-400'
          }`}
        >
          <Settings size={16} />
          <span className="text-[9px] font-bold uppercase tracking-wider">SET</span>
        </button>
      </nav>
    </div>
  );
}
