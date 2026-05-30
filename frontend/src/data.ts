import { Lead, LogEntry, Campaign } from './types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'L-001',
    name: 'Sarah Jenkins',
    title: 'VP of Growth',
    company: 'ScribeFlow',
    email: 'sarah.jenkins@scribeflow.io',
    platform: 'LinkedIn',
    status: 'Verified',
    scrapedAt: '2026-05-30T10:15:00Z',
    score: 94
  },
  {
    id: 'L-002',
    name: 'Marcus Cheng',
    title: 'Founder & CEO',
    company: 'ByteVanguard',
    email: 'm.cheng@bytevanguard.com',
    platform: 'LinkedIn',
    status: 'Verified',
    scrapedAt: '2026-05-30T10:17:00Z',
    score: 98
  },
  {
    id: 'L-003',
    name: 'Elena Rostova',
    title: 'Head of Marketing',
    company: 'NovaCore Ltd',
    email: 'elena@novacore.de',
    platform: 'Instagram',
    status: 'Pending',
    scrapedAt: '2026-05-30T10:20:00Z',
    score: 87
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'C-001',
    name: 'AI SaaS Founders Cold Sequence',
    subject: 'Collaborating on AI lead automation',
    bodyTemplate: 'Hi {name},\n\nNoticed your work as {title} at {company} and loved your vision. Let\'s discuss how we can automate your manual outbound pipelines using specialized AI models.\n\nBest,\nNexus Operator',
    sent: 345,
    opened: 198,
    replied: 43,
    status: 'Active',
    leadsCount: 3,
    createdAt: '2026-05-15T09:00:00Z'
  },
  {
    id: 'C-002',
    name: 'E-commerce CMO Outreach',
    subject: 'Quick question regarding influencer attribution',
    bodyTemplate: 'Hi {name},\n\nI saw your {platform} profile and was looking at what you do as {title} at {company}. Your product catalog looks incredible.\n\nAre you available for a quick chat next week about scaling your attribution loops?\n\nBest,\nNexus Operator',
    sent: 80,
    opened: 52,
    replied: 12,
    status: 'Paused',
    leadsCount: 1,
    createdAt: '2026-05-22T14:30:00Z'
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '13:25:01',
    type: 'SYSTEM',
    message: 'Ready to discover outbound leads. All drivers initialized.'
  },
  {
    id: 'log-2',
    timestamp: '13:25:02',
    type: 'SYSTEM',
    message: 'System configured to launch browser, compile queries, and extract email vectors.'
  },
  {
    id: 'log-3',
    timestamp: '13:25:05',
    type: 'INFO',
    message: 'Waiting for operator search input...'
  },
  {
    id: 'log-4',
    timestamp: '13:26:12',
    type: 'IDLE',
    message: 'Awaiting "Start Scrape" command or query parameters.'
  }
];

export const NEW_POTENTIAL_LEADS: Omit<Lead, 'id' | 'scrapedAt'>[] = [
  {
    name: 'David Vance',
    title: 'Director of Business Dev',
    company: 'Skyward Logistics',
    email: 'd.vance@skyward.org',
    platform: 'Facebook',
    status: 'Verified',
    score: 81
  },
  {
    name: 'Sophia Patel',
    title: 'Marketing Director',
    company: 'Luminate Cosmetics',
    email: 'sophia@luminate.beauty',
    platform: 'Instagram',
    status: 'Verified',
    score: 89
  },
  {
    name: 'Oliver Thorne',
    title: 'Chief Technology Director',
    company: 'Aether CyberSecurity',
    email: 'thorne@aether.io',
    platform: 'LinkedIn',
    status: 'Verified',
    score: 96
  },
  {
    name: 'Cynthia Wu',
    title: 'Product Owner',
    company: 'HyperScale AI',
    email: 'cynthia@hyperscale.ai',
    platform: 'Twitter',
    status: 'Verified',
    score: 91
  },
  {
    name: 'Jonathan Miller',
    title: 'Growth Specialist',
    company: 'PixelVibe Studio',
    email: 'j.miller@pixelvibe.co',
    platform: 'Instagram',
    status: 'Pending',
    score: 75
  },
  {
    name: 'Laura Fontaine',
    title: 'VP of Sales Operations',
    company: 'Zenith Global Retail',
    email: 'laura@zenithretail.com',
    platform: 'Facebook',
    status: 'Unverified',
    score: 68
  },
  {
    name: 'Vikram Mehta',
    title: 'Supply Chain Operations Lead',
    company: 'Stellar Logistics Solutions',
    email: 'v.mehta@stellar.in',
    platform: 'LinkedIn',
    status: 'Verified',
    score: 84
  },
  {
    name: 'Natasha Romanova',
    title: 'Founder & Managing Director',
    company: 'RedRoom Marketing Hub',
    email: 'natasha@redroom.media',
    platform: 'Twitter',
    status: 'Verified',
    score: 95
  }
];
