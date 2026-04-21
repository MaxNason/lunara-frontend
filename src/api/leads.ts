import api from './client';

export interface Lead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  domain: string | null;
  linkedin_url: string | null;
  confidence: number;
  source: string | null;
  campaign_id: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  industry: string | null;
  leads_found: number;
  duration_sec: number | null;
  started_at: string;
  finished_at: string | null;
}

export interface LeadCreate {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  domain?: string;
  linkedin_url?: string;
  website?: string;
}

export const leadsApi = {
  list: (params?: { campaign_id?: string; search?: string; skip?: number; limit?: number }) =>
    api.get<Lead[]>('/leads', { params }),

  create: (data: LeadCreate) => api.post<Lead>('/leads', data),

  remove: (id: string) => api.delete(`/leads/${id}`),

  exportCsv: () =>
    api.get('/leads/export', { responseType: 'blob' }),

  campaigns: () => api.get<Campaign[]>('/campaigns'),
};
