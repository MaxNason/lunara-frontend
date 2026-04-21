import { create } from 'zustand';
import { leadsApi, type Lead, type Campaign, type LeadCreate } from '../api/leads';

interface LeadState {
  leads: Lead[];
  campaigns: Campaign[];
  loading: boolean;
  selectedCampaign: string | null;
  search: string;
  fetchLeads: (params?: { campaign_id?: string; search?: string }) => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  addLead: (data: LeadCreate) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
  setSelectedCampaign: (id: string | null) => void;
  setSearch: (s: string) => void;
  exportCsv: () => Promise<void>;
}

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  campaigns: [],
  loading: false,
  selectedCampaign: null,
  search: '',

  fetchLeads: async (params) => {
    set({ loading: true });
    try {
      const { data } = await leadsApi.list(params);
      set({ leads: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCampaigns: async () => {
    try {
      const { data } = await leadsApi.campaigns();
      set({ campaigns: data });
    } catch {
      // ignore
    }
  },

  removeLead: async (id) => {
    await leadsApi.remove(id);
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
  },

  addLead: async (data) => {
    const { data: lead } = await leadsApi.create(data);
    set((s) => ({ leads: [lead, ...s.leads] }));
  },

  setSelectedCampaign: (id) => set({ selectedCampaign: id }),
  setSearch: (s) => set({ search: s }),

  exportCsv: async () => {
    const { data } = await leadsApi.exportCsv();
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
}));
