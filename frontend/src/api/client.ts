import type {
  AccountInput,
  AccountSummary,
  ActivityInput,
  ActivitySummary,
  AdminSettings,
  ContactInput,
  ContactSummary,
  DashboardKpis,
  DashboardReports,
  IntegrationLeadInput,
  LeadCreateInput,
  LeadConvertInput,
  LeadSummary,
  LeadUpdateInput,
  LoginUser,
  OpportunityStageChangeInput,
  OpportunityInput,
  OpportunitySummary,
  PipelineStage,
  PipelineSummary,
  RolePolicy
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

const mockKpis: DashboardKpis = {
  new_leads: 12,
  hot_leads: 4,
  forecast_amount: "125000000",
  closed_won_amount: "42000000",
  activity_count: 36
};

const mockPipeline: PipelineSummary[] = [
  { stage: "LEAD", probability: 10, count: 8, amount: "24000000" },
  { stage: "QUALIFIED", probability: 25, count: 6, amount: "42000000" },
  { stage: "PROPOSAL", probability: 50, count: 5, amount: "86000000" },
  { stage: "NEGOTIATION", probability: 75, count: 3, amount: "70000000" },
  { stage: "CLOSED_WON", probability: 100, count: 2, amount: "42000000" },
  { stage: "CLOSED_LOST", probability: 0, count: 1, amount: "12000000" }
];

const mockLeads: LeadSummary[] = [
  {
    id: "lead-1",
    company_name: "체리랩",
    contact_name: "김매니저",
    title: "사업기획팀장",
    lead_source: "Web",
    rating: "Hot",
    annual_revenue: "1200000000",
    employee_count: 120,
    campaign_name: "체리 세일즈 런칭",
    source_channel: "website",
    lead_score: 100,
    lead_grade: "HOT",
    status: "NEW"
  },
  {
    id: "lead-2",
    company_name: "데이터스트림즈",
    contact_name: "이책임",
    title: "IT팀 책임",
    lead_source: "Chatbot",
    rating: "Warm",
    annual_revenue: "850000000",
    employee_count: 80,
    campaign_name: "AI 상담 캠페인",
    source_channel: "chatbot",
    lead_score: 65,
    lead_grade: "WARM",
    status: "ASSIGNED"
  }
];

const mockOpportunities: OpportunitySummary[] = [
  {
    id: "opp-1",
    name: "체리랩 전사 도입",
    account_name: "체리랩",
    owner_name: "김도현",
    stage: "PROPOSAL",
    amount: "50000000",
    probability: 50,
    forecast_amount: "25000000",
    expected_close_date: "2026-06-28",
    next_activity: "견적서 검토 회의",
    opportunity_type: "New Business",
    next_step: "계약 검토",
    primary_campaign_source: "체리 세일즈 런칭",
    competitor: "Salesforce"
  },
  {
    id: "opp-2",
    name: "데이터 분석팀 파일럿",
    account_name: "데이터스트림즈",
    owner_name: "박서연",
    stage: "NEGOTIATION",
    amount: "100000000",
    probability: 75,
    forecast_amount: "75000000",
    expected_close_date: "2026-07-15",
    next_activity: "계약 조건 협의",
    opportunity_type: "Expansion",
    next_step: "보안 검토",
    primary_campaign_source: "AI 상담 캠페인",
    competitor: "HubSpot"
  },
  {
    id: "opp-3",
    name: "제조 현장 관리 PoC",
    account_name: "한빛제조",
    owner_name: "이준호",
    stage: "QUALIFIED",
    amount: "42000000",
    probability: 25,
    forecast_amount: "10500000",
    expected_close_date: "2026-07-31",
    next_activity: "요구사항 정리",
    opportunity_type: "New Business",
    next_step: "PoC 범위 확정",
    primary_campaign_source: "제조 세미나",
    competitor: null
  }
];

const mockAccounts: AccountSummary[] = [
  {
    id: "account-1",
    name: "체리랩",
    industry: "SaaS",
    website: "https://cherrylab.example",
    account_type: "Customer",
    annual_revenue: "1200000000",
    employee_count: 120,
    phone: "02-1234-5678",
    owner_id: "김도현"
  },
  {
    id: "account-2",
    name: "데이터스트림즈",
    industry: "데이터",
    account_type: "Prospect",
    annual_revenue: "850000000",
    employee_count: 80,
    phone: "02-555-0101",
    owner_id: "박서연"
  }
];

const mockContacts: ContactSummary[] = [
  {
    id: "contact-1",
    account_id: "account-1",
    name: "김매니저",
    email: "kim@example.com",
    mobile_phone: "010-1234-5678",
    title: "사업기획팀장",
    department: "사업기획팀",
    role_type: "DECISION_MAKER"
  }
];

const mockActivities: ActivitySummary[] = [
  {
    id: "activity-1",
    opportunity_id: "opp-1",
    activity_type: "MEETING",
    activity_date: "2026-05-31T09:30:00+09:00",
    description: "도입 범위 협의",
    next_activity_type: "FOLLOW_UP",
    next_activity_due_date: "2026-06-03",
    next_activity_priority: "HIGH",
    next_activity_memo: "견적서 검토 미팅 준비",
    owner_id: "김도현"
  }
];

const mockReports: DashboardReports = {
  channels: [
    { source_channel: "website", lead_count: 7, hot_lead_count: 3 },
    { source_channel: "chatbot", lead_count: 5, hot_lead_count: 1 }
  ],
  activities_by_owner: [{ owner_id: "김도현", activity_count: 12, meeting_count: 4 }],
  pipeline: mockPipeline,
  integration: { website_leads: 7, chatbot_leads: 5 }
};

const mockAdminSettings: AdminSettings = {
  stage_probabilities: {
    LEAD: 10,
    QUALIFIED: 25,
    PROPOSAL: 50,
    NEGOTIATION: 75,
    CLOSED_WON: 100,
    CLOSED_LOST: 0
  },
  lead_scoring_policy: {
    budget_confirmed: 25,
    authority_confirmed: 25,
    timeline_within_3_months: 25,
    downloaded_material: 10,
    price_page_visit: 5
  },
  integration_policy: {
    website_enabled: true,
    chatbot_enabled: true,
    default_owner_id: ""
  }
};

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = localStorage.getItem("sales-management-token");
  let response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (response.status === 401 && token) {
    localStorage.removeItem("sales-management-token");
    await createDevToken();
    const refreshedToken = localStorage.getItem("sales-management-token");
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(refreshedToken ? { Authorization: `Bearer ${refreshedToken}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  }
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

export async function loadDashboard(): Promise<{
  kpis: DashboardKpis;
  pipeline: PipelineSummary[];
  leads: LeadSummary[];
  opportunities: OpportunitySummary[];
  accounts: AccountSummary[];
  contacts: ContactSummary[];
  activities: ActivitySummary[];
  reports: DashboardReports;
  adminSettings: AdminSettings;
  rolePolicies: RolePolicy[];
  usingMockData: boolean;
}> {
  try {
    await ensureDevToken();
    const overview = await request<{ kpis: DashboardKpis; pipeline: PipelineSummary[] }>(
      "/dashboard/overview"
    );
    const leads = await request<LeadSummary[]>("/leads?page_size=5");
    const opportunities = await request<OpportunitySummary[]>("/opportunities?page_size=10");
    const accounts = await request<AccountSummary[]>("/accounts?page_size=50");
    const contacts = await request<ContactSummary[]>("/contacts?page_size=50");
    const activities = await request<ActivitySummary[]>("/activities?page_size=50");
    const reports = await request<DashboardReports>("/dashboard/reports");
    const adminSettings = await request<AdminSettings>("/admin/settings");
    const rolePolicies = await request<RolePolicy[]>("/admin/role-policy");
    return {
      kpis: overview.kpis,
      pipeline: overview.pipeline,
      leads,
      opportunities,
      accounts,
      contacts,
      activities,
      reports,
      adminSettings,
      rolePolicies,
      usingMockData: false
    };
  } catch {
    return {
      kpis: mockKpis,
      pipeline: mockPipeline,
      leads: mockLeads,
      opportunities: mockOpportunities,
      accounts: mockAccounts,
      contacts: mockContacts,
      activities: mockActivities,
      reports: mockReports,
      adminSettings: mockAdminSettings,
      rolePolicies: [
        {
          role: "SUPER_ADMIN",
          data_scope: "전체 데이터",
          permissions: ["settings:write", "audit:read", "sales:write", "reports:read"]
        },
        {
          role: "SALES_REP",
          data_scope: "본인 담당 데이터",
          permissions: ["sales:write"]
        }
      ],
      usingMockData: true
    };
  }
}

export async function createDevToken(role = "SALES_REP"): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/dev-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "dev-sales-rep",
      email: "sales@example.com",
      name: role === "SUPER_ADMIN" ? "개발 관리자" : "개발 영업 담당자",
      role
    })
  });
  if (!response.ok) {
    throw new Error("Failed to create dev token");
  }
  const body = (await response.json()) as { data: { access_token: string } };
  localStorage.setItem("sales-management-token", body.data.access_token);
}

export async function createAdminDevToken(): Promise<void> {
  await createDevToken("SUPER_ADMIN");
}

export async function createLead(payload: LeadCreateInput): Promise<LeadSummary> {
  await ensureDevToken();
  return request<LeadSummary>("/leads", { method: "POST", body: payload });
}

export async function updateLead(leadId: string, payload: LeadUpdateInput): Promise<LeadSummary> {
  await ensureDevToken();
  return request<LeadSummary>(`/leads/${leadId}`, { method: "PATCH", body: payload });
}

export async function ensureDevToken(): Promise<void> {
  if (!localStorage.getItem("sales-management-token")) {
    await createDevToken();
  }
}

export async function convertLead(leadId: string, payload: LeadConvertInput) {
  await ensureDevToken();
  return request<{ account_id: string; contact_id: string; opportunity_id: string }>(
    `/leads/${leadId}/convert`,
    { method: "POST", body: payload }
  );
}

export async function changeOpportunityStage(
  opportunityId: string,
  payload: OpportunityStageChangeInput
) {
  await ensureDevToken();
  return request<OpportunitySummary>(`/opportunities/${opportunityId}/stage`, {
    method: "POST",
    body: payload
  });
}

export async function createOpportunity(payload: OpportunityInput) {
  await ensureDevToken();
  return request<OpportunitySummary>("/opportunities", { method: "POST", body: payload });
}

export async function updateOpportunity(opportunityId: string, payload: Partial<OpportunityInput>) {
  await ensureDevToken();
  return request<OpportunitySummary>(`/opportunities/${opportunityId}`, {
    method: "PATCH",
    body: payload
  });
}

export async function createAccount(payload: AccountInput) {
  await ensureDevToken();
  return request<AccountSummary>("/accounts", { method: "POST", body: payload });
}

export async function updateAccount(accountId: string, payload: Partial<AccountInput>) {
  await ensureDevToken();
  return request<AccountSummary>(`/accounts/${accountId}`, { method: "PATCH", body: payload });
}

export async function deleteAccount(accountId: string) {
  await ensureDevToken();
  return request<{ id: string; deleted: boolean }>(`/accounts/${accountId}`, { method: "DELETE" });
}

export async function createContact(payload: ContactInput) {
  await ensureDevToken();
  return request<ContactSummary>("/contacts", { method: "POST", body: payload });
}

export async function updateContact(contactId: string, payload: Partial<ContactInput>) {
  await ensureDevToken();
  return request<ContactSummary>(`/contacts/${contactId}`, { method: "PATCH", body: payload });
}

export async function deleteContact(contactId: string) {
  await ensureDevToken();
  return request<{ id: string; deleted: boolean }>(`/contacts/${contactId}`, { method: "DELETE" });
}

export async function createActivity(payload: ActivityInput) {
  await ensureDevToken();
  return request<ActivitySummary>("/activities", { method: "POST", body: payload });
}

export async function updateActivity(activityId: string, payload: Partial<ActivityInput>) {
  await ensureDevToken();
  return request<ActivitySummary>(`/activities/${activityId}`, { method: "PATCH", body: payload });
}

export async function deleteActivity(activityId: string) {
  await ensureDevToken();
  return request<{ id: string; deleted: boolean }>(`/activities/${activityId}`, {
    method: "DELETE"
  });
}

export async function updateAdminSettings(payload: AdminSettings) {
  await createAdminDevToken();
  return request<AdminSettings>("/admin/settings", { method: "PUT", body: payload });
}

export async function createIntegrationLead(channel: "web" | "chatbot", payload: IntegrationLeadInput) {
  const response = await fetch(`${API_BASE}/integrations/${channel}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "local-integration-key"
    },
    body: JSON.stringify({
      ...payload,
      source_channel: channel === "web" ? "website" : "chatbot"
    })
  });
  if (!response.ok) {
    throw new Error(`Integration lead create failed: ${response.status}`);
  }
  const body = (await response.json()) as { data: LeadSummary };
  return body.data;
}

export function defaultStageProbabilities(): Record<PipelineStage, number> {
  return mockAdminSettings.stage_probabilities;
}

const LOGIN_USERS_KEY = "sales-management-login-users";

const defaultLoginUsers: LoginUser[] = [
  {
    name: "관리자",
    email: "admin@cherrylab.com",
    mobile_phone: "010-0000-0001",
    role: "ADMIN",
    organization: "본사",
    title: "시스템 관리자",
    password: "admin1234",
    must_change_password: true
  },
  {
    name: "조직장 김본부",
    email: "manager@cherrylab.com",
    mobile_phone: "010-0000-0002",
    role: "ORG_MANAGER",
    organization: "영업본부",
    title: "영업본부장",
    password: "manager1234",
    must_change_password: true
  },
  {
    name: "영업담당 박세일즈",
    email: "sales@cherrylab.com",
    mobile_phone: "010-0000-0003",
    role: "SALES_REP",
    organization: "영업1팀",
    title: "Account Executive",
    password: "sales1234",
    must_change_password: true
  }
];

function getLoginUsersLocal(): LoginUser[] {
  const raw = localStorage.getItem(LOGIN_USERS_KEY);
  if (!raw) {
    localStorage.setItem(LOGIN_USERS_KEY, JSON.stringify(defaultLoginUsers));
    return defaultLoginUsers;
  }
  try {
    const parsed = JSON.parse(raw) as LoginUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOGIN_USERS_KEY, JSON.stringify(defaultLoginUsers));
      return defaultLoginUsers;
    }
    return parsed;
  } catch {
    localStorage.setItem(LOGIN_USERS_KEY, JSON.stringify(defaultLoginUsers));
    return defaultLoginUsers;
  }
}

function setLoginUsersLocal(users: LoginUser[]) {
  localStorage.setItem(LOGIN_USERS_KEY, JSON.stringify(users));
}

export async function loadLoginUsers(): Promise<LoginUser[]> {
  return getLoginUsersLocal();
}

export async function upsertLoginUser(user: LoginUser): Promise<LoginUser[]> {
  const users = getLoginUsersLocal();
  const normalizedEmail = user.email.trim().toLowerCase();
  const exists = users.some((item) => item.email.toLowerCase() === normalizedEmail);
  const nextUsers = exists
    ? users.map((item) =>
        item.email.toLowerCase() === normalizedEmail
          ? {
              ...item,
              ...user,
              email: normalizedEmail,
              password: user.password?.trim() ? user.password : item.password
            }
          : item
      )
    : [
        ...users,
        {
          ...user,
          email: normalizedEmail,
          must_change_password: true
        }
      ];
  setLoginUsersLocal(nextUsers);
  return nextUsers;
}

export async function deleteLoginUser(email: string): Promise<LoginUser[]> {
  const nextUsers = getLoginUsersLocal().filter(
    (user) => user.email.toLowerCase() !== email.trim().toLowerCase()
  );
  setLoginUsersLocal(nextUsers.length > 0 ? nextUsers : defaultLoginUsers);
  return getLoginUsersLocal();
}

export async function authenticateLoginUser(email: string, password: string): Promise<LoginUser | null> {
  const user = getLoginUsersLocal().find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
  );
  return user ?? null;
}

export async function changeLoginUserPassword(
  email: string,
  currentPassword: string,
  nextPassword: string
): Promise<{ success: boolean; message: string }> {
  const users = getLoginUsersLocal();
  const target = users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
  if (!target) {
    return { success: false, message: "사용자를 찾을 수 없습니다." };
  }
  if ((target.password ?? "") !== currentPassword) {
    return { success: false, message: "현재 비밀번호가 일치하지 않습니다." };
  }
  const passwordRule = /^(?=.{8,}$)(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z0-9])|(?=.*\d)(?=.*[^A-Za-z0-9])).*$/;
  if (!passwordRule.test(nextPassword)) {
    return { success: false, message: "새 비밀번호는 8자 이상, 문자/숫자/특수문자 중 2가지 이상 조합이어야 합니다." };
  }
  setLoginUsersLocal(
    users.map((user) =>
      user.email.toLowerCase() === email.trim().toLowerCase()
        ? { ...user, password: nextPassword, must_change_password: false }
        : user
    )
  );
  return { success: true, message: "비밀번호가 변경되었습니다." };
}

export async function sendLoginCredentialEmail(
  toEmail: string,
  userName: string,
  temporaryPassword: string
): Promise<{ sent: boolean; message: string }> {
  try {
    await createAdminDevToken();
    return await request<{ sent: boolean; message: string }>("/admin/notify-login-credential", {
      method: "POST",
      body: {
        to_email: toEmail,
        user_name: userName,
        temporary_password: temporaryPassword
      }
    });
  } catch {
    return { sent: false, message: "메일 발송 API 호출 실패" };
  }
}
