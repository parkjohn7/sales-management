export type LeadGrade = "HOT" | "WARM" | "COLD";
export type LoginUserRole = "ADMIN" | "ORG_MANAGER" | "SALES_REP";
export type PipelineStage =
  | "LEAD"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export interface DashboardKpis {
  new_leads: number;
  hot_leads: number;
  forecast_amount: string;
  closed_won_amount: string;
  activity_count: number;
}

export interface PipelineSummary {
  stage: PipelineStage;
  probability: number;
  count: number;
  amount: string;
}

export interface LeadSummary {
  id: string;
  company_name: string;
  contact_name: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  lead_source?: string | null;
  rating?: string | null;
  annual_revenue?: string | null;
  employee_count?: number | null;
  campaign_name?: string | null;
  source_channel: string;
  inquiry_content?: string | null;
  lead_score: number;
  lead_grade: LeadGrade;
  status: string;
}

export interface OpportunitySummary {
  id: string;
  account_id?: string;
  contact_id?: string | null;
  lead_id?: string | null;
  name: string;
  stage: PipelineStage;
  amount: string;
  probability: number;
  forecast_amount: string;
  account_name?: string;
  owner_name?: string;
  expected_close_date?: string | null;
  opportunity_type?: string | null;
  primary_campaign_source?: string | null;
  competitor?: string | null;
  lost_reason?: string | null;
  stage_checklist_state?: Record<string, Record<string, boolean>> | null;
}

export interface OpportunityChecklistItem {
  key: string;
  title: string;
  description: string;
  checked: boolean;
}

export interface OpportunityChecklist {
  stage: PipelineStage;
  stage_label: string;
  enabled: boolean;
  has_related_activity: boolean;
  auto_advance_to?: PipelineStage | null;
  items: OpportunityChecklistItem[];
}

export interface OpportunityChecklistToggleResult {
  opportunity: OpportunitySummary;
  checklist: OpportunityChecklist;
  auto_advanced: boolean;
  auto_advanced_to?: PipelineStage | null;
}

export interface AccountSummary {
  id: string;
  name: string;
  business_number?: string | null;
  industry?: string | null;
  website?: string | null;
  address?: string | null;
  account_type?: string | null;
  annual_revenue?: string | null;
  employee_count?: number | null;
  phone?: string | null;
  owner_id?: string | null;
}

export interface ContactSummary {
  id: string;
  account_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  role_type?: string | null;
  mobile_phone?: string | null;
  department?: string | null;
}

export interface ActivitySummary {
  id: string;
  lead_id?: string | null;
  opportunity_id?: string | null;
  activity_type: string;
  activity_date: string;
  due_date?: string | null;
  status?: string | null;
  priority?: string | null;
  description?: string | null;
  next_activity_type?: string | null;
  next_activity_due_date?: string | null;
  next_activity_priority?: string | null;
  next_activity_memo?: string | null;
  owner_id?: string | null;
}

export interface RolePolicy {
  role: string;
  data_scope: string;
  permissions: string[];
}

export interface AdminSettings {
  stage_probabilities: Record<PipelineStage, number>;
  lead_scoring_policy: Record<string, number>;
  integration_policy: Record<string, boolean | string>;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface DashboardReports {
  channels: Array<{
    source_channel: string;
    lead_count: number;
    hot_lead_count: number;
  }>;
  activities_by_owner: Array<{
    owner_id: string;
    activity_count: number;
    [key: string]: string | number;
  }>;
  pipeline: PipelineSummary[];
  integration: {
    website_leads: number;
    chatbot_leads: number;
  };
}

export interface LeadCreateInput {
  company_name: string;
  contact_name: string;
  email?: string;
  phone?: string;
  title?: string;
  lead_source?: string;
  rating?: string;
  annual_revenue?: string;
  employee_count?: number;
  campaign_name?: string;
  source_channel: string;
  inquiry_content?: string;
  budget_confirmed: boolean;
  authority_confirmed: boolean;
  timeline_within_3_months: boolean;
  price_page_visit_count: number;
  downloaded_material: boolean;
}

export interface LeadUpdateInput
  extends Partial<Omit<LeadCreateInput, "employee_count" | "annual_revenue">> {
  employee_count?: number | null;
  annual_revenue?: string | null;
  status?: string;
  owner_id?: string | null;
}

export interface LeadConvertInput {
  opportunity_name?: string;
  amount: string;
}

export interface OpportunityStageChangeInput {
  stage: PipelineStage;
  reason?: string;
  closed_date?: string;
  lost_reason?: string;
}

export interface OpportunityInput {
  account_id: string;
  contact_id?: string;
  lead_id?: string;
  name: string;
  stage?: PipelineStage;
  amount?: string;
  expected_close_date?: string;
  owner_id?: string;
  opportunity_type?: string;
  primary_campaign_source?: string;
  competitor?: string;
  reason?: string;
  closed_date?: string;
  lost_reason?: string;
}

export interface AccountInput {
  name: string;
  business_number?: string;
  industry?: string;
  website?: string;
  address?: string;
  account_type?: string;
  annual_revenue?: string;
  employee_count?: number;
  phone?: string;
  owner_id?: string;
}

export interface ContactInput {
  account_id: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  role_type?: string;
  mobile_phone?: string;
  department?: string;
}

export interface ActivityInput {
  lead_id?: string;
  opportunity_id?: string;
  activity_type: string;
  activity_date: string;
  due_date?: string;
  status?: string;
  priority?: string;
  description?: string;
  next_activity_type?: string;
  next_activity_due_date?: string;
  next_activity_priority?: string;
  next_activity_memo?: string;
}

export interface IntegrationLeadInput extends LeadCreateInput {
  raw_payload?: Record<string, unknown>;
  chatbot_log?: Record<string, unknown>;
}

export interface LoginUser {
  name: string;
  email: string;
  mobile_phone?: string;
  role: LoginUserRole;
  organization: string;
  title?: string;
  password?: string;
  must_change_password?: boolean;
}
