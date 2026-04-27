import api from './client';

export interface CampaignLog {
  id: string;
  target_username: string;
  target_url: string;
  message_text: string;
  status: string;
  sent_at: string | null;
}

export interface Campaign {
  id: string;
  mode: string;
  target_query: string;
  status: string;
  succeeded: number;
  failed: number;
  created_at: string;
  logs: CampaignLog[];
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await api.get<Campaign[]>('/integrations/instagram/campaigns');
  return res.data;
}
