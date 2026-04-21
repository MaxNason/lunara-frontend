import api from './client';

export interface CompanyProfile {
  id: string;
  company_name: string;
  company_domain: string;
  industry: string;
  description: string;
  value_proposition: string;
  target_industries: string[];
  target_titles: string[];
  target_regions: string[];
  target_company_sizes: string[];
  target_keywords: string[];
  ideal_customer_desc: string;
  preferred_channels: string[];
  budget_range: string;
  is_configured: boolean;
}

export interface CompanyUpdate {
  company_name?: string;
  company_domain?: string;
  industry?: string;
  description?: string;
  value_proposition?: string;
  target_industries?: string[];
  target_titles?: string[];
  target_regions?: string[];
  target_company_sizes?: string[];
  target_keywords?: string[];
  ideal_customer_desc?: string;
  preferred_channels?: string[];
  budget_range?: string;
}

export const companyApi = {
  get: () => api.get<CompanyProfile>('/company'),
  update: (data: CompanyUpdate) => api.put<CompanyProfile>('/company', data),
};
