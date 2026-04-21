import api from './client';

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export interface DashboardData {
  total_leads: number;
  emails_found: number;
  total_campaigns: number;
  leads_by_source: Record<string, number>;
  leads_by_company: Record<string, number>;
  recent_campaigns: Array<{
    id: number;
    name: string;
    status: string;
    leads_found: number;
    started_at: string;
  }>;
}

export const chatApi = {
  history: () => api.get<ChatMessage[]>('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
};

export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard'),
};
