export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter';
  status: 'pending' | 'generated' | 'sent' | 'failed' | 'unsubscribed' | 'Verified' | 'Unverified' | 'Pending' | 'Bounced';
  scrapedAt: string;
  score: number; // Fit score (0-100)
  generated_subject?: string;
  generated_body?: string;
  error_message?: string | null;
  sent_at?: string | null;
  created_at?: string;
  source_url?: string;
}

export interface ScrapeConfig {
  searchQuery: string;
  platforms: ('Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter')[];
  resultsLimit: number;
  launchChrome: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'SYSTEM' | 'INFO' | 'SUCCESS' | 'ERROR' | 'QUERY' | 'SCRAPE' | 'IDLE';
  message: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  bodyTemplate: string;
  sent: number;
  opened: number;
  replied: number;
  status: 'Active' | 'Paused' | 'Draft';
  leadsCount: number;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  prompt: string;
  createdAt: string;
}
