import { Activity, Check, CircleHelp, Flame, Target, TrendingUp } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  convertLead,
  createAccount,
  createActivity,
  createContact,
  createIntegrationLead,
  createOpportunity,
  deleteAccount,
  deleteActivity,
  deleteContact,
  updateAdminSettings,
  updateAccount,
  updateActivity,
  updateContact,
  updateLead,
  updateOpportunity
} from "../api/client";
import { MetricCard } from "../components/MetricCard";
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
  LeadSummary,
  OpportunityInput,
  OpportunitySummary,
  PipelineStage,
  PipelineSummary,
  RolePolicy
} from "../api/types";

interface DashboardProps {
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
  onCreateLead: (payload: LeadCreateInput) => Promise<void>;
  onDataChanged: () => Promise<void>;
}

const formatter = new Intl.NumberFormat("ko-KR");
const menuItems = [
  "대시보드",
  "리드",
  "고객사",
  "영업기회",
  "활동",
  "리포트",
  "연동",
  "관리자"
] as const;
type MenuItem = (typeof menuItems)[number];

function money(value: string) {
  return `${formatter.format(Number(value))}원`;
}

function digitsOnly(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function numberText(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(num)) return "";
  return formatter.format(num);
}

function EnumLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <span title={hint} className="inline-flex text-slate-400">
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </span>
  );
}

function gradeClass(grade: LeadSummary["lead_grade"]) {
  if (grade === "HOT") return "bg-coral/10 text-coral";
  if (grade === "WARM") return "bg-gold/10 text-gold";
  return "bg-ink/10 text-ink";
}

function statusPillClass(value: string) {
  if (value.includes("WON") || value === "HOT") return "bg-emerald-50 text-emerald-700";
  if (value.includes("LOST")) return "bg-rose-50 text-rose-700";
  if (value === "WARM" || value.includes("PROPOSAL")) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

const panelClass = "rounded-md border border-slate-200 bg-white shadow-sm";
const tableClass = "w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm";
const compactTableClass = "w-full min-w-[620px] border-separate border-spacing-0 text-left text-sm";
const tableScrollClass = "max-h-[420px] overflow-auto [scrollbar-gutter:stable_both-edges]";
const thClass = "sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600";
const tdClass = "border-b border-slate-100 px-3 py-1.5 align-middle";
const cherryTextClass = "font-bold text-rose-700";
const cherryHoverRowClass = "bg-white hover:bg-rose-50";

const stageLabels: Record<PipelineStage, string> = {
  LEAD: "Lead",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Won",
  CLOSED_LOST: "Lost"
};

const stages: PipelineStage[] = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST"
];

function stageTone(stage: PipelineStage) {
  if (stage === "CLOSED_WON") return "border-mint bg-mint/10";
  if (stage === "CLOSED_LOST") return "border-rose-400 bg-rose-50";
  if (stage === "NEGOTIATION") return "border-gold bg-gold/10";
  return "border-line bg-white";
}

function parseOptionalCount(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

function MobileSalesEntry({
  onCreateLead,
  selectedLead,
  onDataChanged
}: {
  onCreateLead: DashboardProps["onCreateLead"];
  selectedLead?: LeadSummary;
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const leadSourceHelp: Record<string, string> = {
    Direct: "직접 발굴한 리드입니다. (아웃바운드/소개 포함)",
    Web: "웹사이트, 랜딩페이지, 폼 등 온라인 유입 리드입니다.",
    Partner: "파트너사/리셀러를 통해 소개된 리드입니다.",
    Event: "세미나, 전시회, 오프라인 행사에서 유입된 리드입니다."
  };
  const [form, setForm] = useState<LeadCreateInput>({
    company_name: selectedLead?.company_name ?? "",
    contact_name: selectedLead?.contact_name ?? "",
    email: selectedLead?.email ?? "",
    phone: selectedLead?.phone ?? "",
    title: selectedLead?.title ?? "",
    lead_source: selectedLead?.lead_source ?? "Direct",
    rating: selectedLead?.rating ?? "Warm",
    annual_revenue: selectedLead?.annual_revenue ?? "",
    employee_count: selectedLead?.employee_count ?? undefined,
    campaign_name: selectedLead?.campaign_name ?? "",
    source_channel: selectedLead?.source_channel ?? "manual",
    inquiry_content: selectedLead?.inquiry_content ?? "",
    budget_confirmed: false,
    authority_confirmed: false,
    timeline_within_3_months: false,
    price_page_visit_count: 0,
    downloaded_material: false
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isEdit = Boolean(selectedLead);

  function update<K extends keyof LeadCreateInput>(key: K, value: LeadCreateInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("saving");
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, {
          ...form,
          annual_revenue: form.annual_revenue || undefined,
          employee_count: form.employee_count ?? undefined
        });
        await onDataChanged();
      } else {
        await onCreateLead({
          ...form,
          annual_revenue: form.annual_revenue || undefined,
          employee_count: form.employee_count ?? undefined
        });
        setForm((current) => ({
          ...current,
          company_name: "",
          contact_name: "",
          email: "",
          phone: "",
          title: "",
          lead_source: "Direct",
          rating: "Warm",
          annual_revenue: "",
          employee_count: undefined,
          campaign_name: "",
          inquiry_content: "",
          budget_confirmed: false,
          authority_confirmed: false,
          timeline_within_3_months: false,
          downloaded_material: false
        }));
      }
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{isEdit ? "리드 수정" : "리드 등록"}</h3>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">
            <Check className="h-3 w-3" aria-hidden="true" />
            저장됨
          </span>
        )}
      </div>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            고객사
            <input
              required
              value={form.company_name}
              onChange={(event) => update("company_name", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
              placeholder="예: 체리랩"
            />
          </label>
          <label className="block text-sm font-medium">
            담당자
            <input
              required
              value={form.contact_name}
              onChange={(event) => update("contact_name", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
              placeholder="예: 김매니저"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            이메일
            <input
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            휴대폰
            <input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            직책
            <input
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            <EnumLabel
              label="리드 소스"
              hint="Direct: 직접 발굴, Web: 웹 유입, Partner: 파트너 소개, Event: 행사 유입"
            />
            <select
              value={form.lead_source}
              onChange={(event) => update("lead_source", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
            >
              <option value="Direct" title={leadSourceHelp.Direct}>
                Direct
              </option>
              <option value="Web" title={leadSourceHelp.Web}>
                Web
              </option>
              <option value="Partner" title={leadSourceHelp.Partner}>
                Partner
              </option>
              <option value="Event" title={leadSourceHelp.Event}>
                Event
              </option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {leadSourceHelp[String(form.lead_source ?? "")] || ""}
            </p>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            리드처리상태
            <input
              value={isEdit ? (selectedLead?.status ?? "-") : "NEW (생성 시 자동 설정)"}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
            />
          </label>
          <label className="block text-sm font-medium">
            리드품질
            <input
              value={
                isEdit
                  ? `${selectedLead?.lead_grade ?? "-"} (${selectedLead?.lead_score ?? "-"}점)`
                  : "점수 기반 자동 계산 (HOT/WARM/COLD)"
              }
              readOnly
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            예상 매출
            <input
              value={numberText(form.annual_revenue)}
              onChange={(event) => {
                const only = digitsOnly(event.target.value);
                update("annual_revenue", only ? String(Number(only)) : "");
              }}
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-right text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            직원 수
            <input
              type="number"
              min="0"
              value={form.employee_count ?? ""}
              onChange={(event) =>
                update("employee_count", parseOptionalCount(event.target.value) ?? undefined)
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          캠페인
          <input
            value={form.campaign_name}
            onChange={(event) => update("campaign_name", event.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          문의 내용
          <textarea
            value={form.inquiry_content}
            onChange={(event) => update("inquiry_content", event.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border border-line px-3 py-2.5 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["budget_confirmed", "예산 확인"],
            ["authority_confirmed", "의사결정권"],
            ["timeline_within_3_months", "3개월 내"],
            ["downloaded_material", "자료 요청"]
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-md border border-line p-3">
              <input
                type="checkbox"
                checked={Boolean(form[key as keyof LeadCreateInput])}
                onChange={(event) =>
                  update(key as keyof LeadCreateInput, event.target.checked as never)
                }
              />
              {label}
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-md bg-rose-600 px-4 py-2.5 text-base font-bold text-white disabled:opacity-60"
        >
          {status === "saving" ? "저장 중" : isEdit ? "리드 수정" : "리드 저장"}
        </button>
        {status === "error" && (
          <p className="text-sm font-medium text-coral">API 연결을 확인한 뒤 다시 저장해주세요.</p>
        )}
      </form>
    </section>
  );
}

interface BusinessPipelineRow {
  id: string;
  title: string;
  subtitle: string;
  stage: PipelineStage;
  amountLabel: string;
  forecastLabel: string;
  ownerLabel: string;
  stageMeta: string;
  expectedCloseDate?: string | null;
}

function buildBusinessRows(
  opportunities: OpportunitySummary[],
  leads: LeadSummary[]
): BusinessPipelineRow[] {
  const opportunityRows = opportunities.map((opportunity) => ({
    id: `opportunity-${opportunity.id}`,
    title: opportunity.account_name ?? opportunity.name,
    subtitle: opportunity.name,
    stage: opportunity.stage,
    amountLabel: money(opportunity.amount),
    forecastLabel: `Forecast ${money(opportunity.forecast_amount)}`,
    ownerLabel: opportunity.owner_name ?? "담당자 미정",
    stageMeta: `확률 ${opportunity.probability}%`,
    expectedCloseDate: opportunity.expected_close_date
  }));
  const leadRows = leads.map((lead) => ({
    id: `lead-${lead.id}`,
    title: lead.company_name,
    subtitle: `${lead.contact_name} · ${lead.source_channel}`,
    stage: "LEAD" as PipelineStage,
    amountLabel: "금액 미정",
    forecastLabel: `${lead.lead_score}점 · ${lead.lead_grade}`,
    ownerLabel: "리드",
    stageMeta: lead.status,
    expectedCloseDate: null
  }));
  return [...opportunityRows, ...leadRows];
}

function StageMatrix({
  opportunities,
  leads
}: {
  opportunities: OpportunitySummary[];
  leads: LeadSummary[];
}) {
  const businessRows = buildBusinessRows(opportunities, leads);

  return (
    <section className="mt-4 rounded-lg border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold">사업별 스테이지 매핑</h3>
        <span className="text-sm text-slate-600">세로는 사업, 가로는 단계</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[220px_repeat(6,minmax(120px,1fr))] gap-2">
            <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold">사업</div>
            {stages.map((stage) => (
              <div key={stage} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold">
                {stageLabels[stage]}
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {businessRows.map((business) => (
              <div
                key={business.id}
                className="grid grid-cols-[220px_repeat(6,minmax(120px,1fr))] gap-2"
              >
                <div className="rounded-md border border-line bg-[#f8fafb] p-3">
                  <strong className="block text-sm">{business.title}</strong>
                  <span className="mt-1 block text-xs text-slate-600">{business.subtitle}</span>
                  <span className="mt-2 block text-xs font-semibold">{business.amountLabel}</span>
                </div>
                {stages.map((stage) => (
                  <div key={stage} className="min-h-28 rounded-md border border-dashed border-line p-2">
                    {business.stage === stage && (
                      <article className={`h-full rounded-md border p-3 ${stageTone(stage)}`}>
                        <strong className="block text-sm">{stageLabels[stage]}</strong>
                        <p className="mt-1 text-xs text-slate-700">{business.forecastLabel}</p>
                        <p className="mt-1 text-xs text-slate-700">{business.stageMeta}</p>
                        <p className="mt-2 text-xs text-slate-600">{business.ownerLabel}</p>
                        {business.expectedCloseDate && (
                          <p className="mt-1 text-xs text-slate-600">{business.expectedCloseDate}</p>
                        )}
                      </article>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardHome({
  kpis,
  pipeline,
  leads,
  opportunities,
  reports
}: {
  kpis: DashboardKpis;
  pipeline: PipelineSummary[];
  leads: LeadSummary[];
  opportunities: OpportunitySummary[];
  reports: DashboardReports;
}) {
  const forecastTrend = pipeline.map((stage, index) => ({
    name: stageLabels[stage.stage],
    forecast: Number(stage.amount) * (stage.probability / 100),
    amount: Number(stage.amount),
    sequence: index + 1
  }));
  const channelRows = reports.channels.length
    ? reports.channels
    : [{ source_channel: "manual", lead_count: leads.length, hot_lead_count: kpis.hot_leads }];
  const topOpportunities = opportunities.slice(0, 5);

  return (
    <section className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Flame} label="Hot Lead" value={`${kpis.hot_leads}건`} tone="coral" />
        <MetricCard icon={Target} label="신규 리드" value={`${kpis.new_leads}건`} tone="mint" />
        <MetricCard icon={TrendingUp} label="Forecast" value={money(kpis.forecast_amount)} tone="gold" />
        <MetricCard icon={Activity} label="활동 기록" value={`${kpis.activity_count}건`} tone="ink" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className={`${panelClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Revenue Analytics</h3>
              <p className="mt-1 text-sm text-slate-500">스테이지별 예상 매출 흐름</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              Live Pipeline
            </span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastTrend}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => money(String(value))} />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#be123c"
                  strokeWidth={3}
                  fill="url(#forecastGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${panelClass} p-4`}>
          <h3 className="text-lg font-bold">User Insights</h3>
          <p className="mt-1 text-sm text-slate-500">채널별 리드 인입 품질</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelRows}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source_channel" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="lead_count" fill="#be123c" radius={[6, 6, 0, 0]} />
                <Bar dataKey="hot_lead_count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
            <h3 className="text-lg font-bold">Top Opportunities</h3>
            <span className="text-sm font-semibold text-slate-500">{topOpportunities.length} rows</span>
          </div>
          <div className={tableScrollClass}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>사업</th>
                  <th className={thClass}>고객사</th>
                  <th className={thClass}>단계</th>
                  <th className={thClass}>금액</th>
                  <th className={thClass}>Forecast</th>
                </tr>
              </thead>
              <tbody>
                {topOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className={cherryHoverRowClass}>
                    <td className={`${tdClass} ${cherryTextClass}`}>{opportunity.name}</td>
                    <td className={tdClass}>{opportunity.account_name ?? "고객사 미정"}</td>
                    <td className={tdClass}>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusPillClass(opportunity.stage)}`}>
                        {stageLabels[opportunity.stage]}
                      </span>
                    </td>
                    <td className={tdClass}>{money(opportunity.amount)}</td>
                    <td className={tdClass}>{money(opportunity.forecast_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${panelClass} p-4`}>
          <h3 className="text-lg font-bold">Sales Health</h3>
          <div className="mt-4 space-y-4">
            {[
              ["Forecast Coverage", Number(kpis.forecast_amount), "#be123c"],
              ["Closed Won", Number(kpis.closed_won_amount), "#10b981"],
              ["Lead Volume", kpis.new_leads + kpis.hot_leads, "#f59e0b"]
            ].map(([label, value, color]) => {
              const normalized = Math.min(100, Number(value) === 0 ? 8 : Math.max(18, Number(value) % 100));
              return (
                <div key={String(label)}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">{label}</span>
                    <span className="font-bold text-slate-900">{normalized}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${normalized}%`, backgroundColor: String(color) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <StageMatrix opportunities={opportunities} leads={leads} />
    </section>
  );
}

function LeadSection({
  leads,
  onCreateLead,
  onDataChanged
}: {
  leads: LeadSummary[];
  onCreateLead: DashboardProps["onCreateLead"];
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [status, setStatus] = useState("");
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId);

  async function handleQuickConvert(lead: LeadSummary) {
    setStatus("전환 중");
    try {
      await convertLead(lead.id, {
        opportunity_name: `${lead.company_name} 영업기회`,
        amount: "0"
      });
      setStatus("고객사/연락처/영업기회로 전환되었습니다.");
      await onDataChanged();
    } catch {
      setStatus("전환 실패: API 연결 또는 이미 전환된 리드인지 확인해주세요.");
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <MobileSalesEntry
            key={selectedLead?.id ?? "new"}
            onCreateLead={onCreateLead}
            selectedLead={selectedLead}
            onDataChanged={onDataChanged}
          />
          {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
        </div>
        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
            <h3 className="text-lg font-bold">리드 목록</h3>
            <span className="text-sm font-semibold text-slate-500">{leads.length} rows</span>
          </div>
          <div className={tableScrollClass}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>고객사</th>
                  <th className={thClass}>담당자</th>
                  <th className={`${thClass} hidden sm:table-cell`}>직책</th>
                  <th className={`${thClass} hidden md:table-cell`}>직원 수</th>
                  <th className={thClass}>리드품질</th>
                  <th className={thClass}>점수</th>
                  <th className={thClass}>리드처리상태</th>
                  <th className={thClass}>작업</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`cursor-pointer hover:bg-rose-50 ${
                      selectedLead?.id === lead.id ? "bg-rose-50" : "bg-white"
                    }`}
                  >
                    <td className={`${tdClass} ${cherryTextClass}`}>{lead.company_name}</td>
                    <td className={tdClass}>{lead.contact_name}</td>
                    <td className={`${tdClass} hidden sm:table-cell`}>{lead.title || "-"}</td>
                    <td className={`${tdClass} hidden md:table-cell`}>
                      {lead.employee_count ? formatter.format(lead.employee_count) : "-"}
                    </td>
                    <td className={tdClass}>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${gradeClass(lead.lead_grade)}`}>
                        {lead.lead_grade}
                      </span>
                    </td>
                    <td className={tdClass}>{lead.lead_score}</td>
                    <td className={tdClass}>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusPillClass(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleQuickConvert(lead);
                        }}
                        className="rounded border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700"
                      >
                        영업기회 전환
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountSection({
  accounts,
  contacts,
  onDataChanged
}: {
  accounts: AccountSummary[];
  contacts: ContactSummary[];
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
  const selectedContact = contacts.find((contact) => contact.id === selectedContactId);
  const [accountForm, setAccountForm] = useState<AccountInput>({
    name: selectedAccount?.name ?? "",
    account_type: selectedAccount?.account_type ?? "Prospect",
    industry: selectedAccount?.industry ?? "",
    annual_revenue: selectedAccount?.annual_revenue ?? "",
    employee_count: selectedAccount?.employee_count ?? 0,
    phone: selectedAccount?.phone ?? "",
    website: selectedAccount?.website ?? "",
    address: selectedAccount?.address ?? "",
    owner_id: selectedAccount?.owner_id ?? ""
  });
  const [contactForm, setContactForm] = useState<ContactInput>({
    account_id: selectedContact?.account_id ?? accounts[0]?.id ?? "",
    name: selectedContact?.name ?? "",
    email: selectedContact?.email ?? "",
    phone: selectedContact?.phone ?? "",
    mobile_phone: selectedContact?.mobile_phone ?? "",
    title: selectedContact?.title ?? "",
    department: selectedContact?.department ?? "",
    role_type: selectedContact?.role_type ?? "PRACTITIONER"
  });
  const [status, setStatus] = useState("");

  async function handleCreateAccount(event: FormEvent) {
    event.preventDefault();
    setStatus("고객사 저장 중");
    try {
      const payload = {
        ...accountForm,
        annual_revenue: accountForm.annual_revenue || undefined,
        employee_count: accountForm.employee_count || undefined
      };
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, payload);
        setStatus("고객사를 수정했습니다.");
      } else {
        await createAccount(payload);
        setStatus("고객사를 저장했습니다.");
      }
      await onDataChanged();
    } catch {
      setStatus("고객사 저장 실패");
    }
  }

  async function handleCreateContact(event: FormEvent) {
    event.preventDefault();
    setStatus("연락처 저장 중");
    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, contactForm);
        setStatus("연락처를 수정했습니다.");
      } else {
        await createContact(contactForm);
        setStatus("연락처를 저장했습니다.");
      }
      await onDataChanged();
    } catch {
      setStatus("연락처 저장 실패: 고객사를 선택해주세요.");
    }
  }

  return (
    <section className="grid min-w-0 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <form className="rounded-lg border border-line bg-white p-4" onSubmit={handleCreateAccount}>
          <h3 className="text-lg font-bold">{selectedAccount ? "고객사 수정" : "고객사 등록"}</h3>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium">
              고객사
              <input
                required
                value={accountForm.name}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, name: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="고객사명"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                <EnumLabel
                  label="유형"
                  hint="Prospect: 잠재고객, Customer: 기존고객, Partner: 파트너, Competitor: 경쟁사"
                />
                <select
                  value={accountForm.account_type}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, account_type: event.target.value }))
                  }
                  className="mt-1 w-full min-w-0 rounded-md border border-line px-3 py-2"
                >
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                  <option value="Partner">Partner</option>
                  <option value="Competitor">Competitor</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                휴대폰
                <input
                  value={accountForm.phone}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="mt-1 w-full min-w-0 rounded-md border border-line px-3 py-2"
                  placeholder="대표 휴대폰"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              산업
              <input
                value={accountForm.industry}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, industry: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="산업"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                연 매출
                <input
                  value={numberText(accountForm.annual_revenue)}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      annual_revenue: digitsOnly(event.target.value)
                    }))
                  }
                  className="mt-1 w-full min-w-0 rounded-md border border-line px-3 py-2 text-right"
                  placeholder="연 매출"
                />
              </label>
              <label className="block text-sm font-medium">
                직원 수
                <input
                  type="number"
                  min="0"
                  value={accountForm.employee_count}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      employee_count: Number(event.target.value)
                    }))
                  }
                  className="mt-1 w-full min-w-0 rounded-md border border-line px-3 py-2"
                  placeholder="직원 수"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              담당자
              <input
                value={accountForm.owner_id}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, owner_id: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="담당자"
              />
            </label>
            <label className="block text-sm font-medium">
              웹사이트
              <input
                value={accountForm.website}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, website: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="웹사이트"
              />
            </label>
            <button className="w-full rounded-md bg-rose-600 px-4 py-2 font-bold text-white">
              {selectedAccount ? "고객사 수정" : "고객사 저장"}
            </button>
          </div>
        </form>
        <form className="rounded-lg border border-line bg-white p-4" onSubmit={handleCreateContact}>
          <h3 className="text-lg font-bold">{selectedContact ? "연락처 수정" : "연락처 등록"}</h3>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium">
              고객사
              <select
                required
                value={contactForm.account_id}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, account_id: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
              >
                <option value="">고객사 선택</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              이름
              <input
                required
                value={contactForm.name}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, name: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="이름"
              />
            </label>
            <label className="block text-sm font-medium">
              이메일
              <input
                value={contactForm.email}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, email: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="이메일"
              />
            </label>
            <label className="block text-sm font-medium">
              직책
              <input
                value={contactForm.title}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, title: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="직책"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={contactForm.department}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, department: event.target.value }))
                }
                className="w-full min-w-0 rounded-md border border-line px-3 py-2"
                placeholder="부서"
              />
              <input
                value={contactForm.mobile_phone}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, mobile_phone: event.target.value }))
                }
                className="w-full min-w-0 rounded-md border border-line px-3 py-2"
                placeholder="휴대폰"
              />
            </div>
            <label className="block text-sm font-medium">
              <EnumLabel
                label="역할"
                hint="DECISION_MAKER: 의사결정권자, PRACTITIONER: 실무자, PROCUREMENT: 구매담당"
              />
              <select
                value={contactForm.role_type}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, role_type: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
              >
                <option value="DECISION_MAKER">Decision Maker</option>
                <option value="PRACTITIONER">Practitioner</option>
                <option value="PROCUREMENT">Procurement</option>
              </select>
            </label>
            <button className="w-full rounded-md bg-rose-600 px-4 py-2 font-bold text-white">
              {selectedContact ? "연락처 수정" : "연락처 저장"}
            </button>
          </div>
        </form>
      </div>
      <div className="min-w-0 space-y-4">
        <section className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <h3 className="text-lg font-bold">고객사 목록</h3>
            <span className="text-sm font-semibold text-slate-500">{accounts.length} rows</span>
          </div>
          <div className={tableScrollClass}>
            <table className={compactTableClass}>
              <thead>
                <tr>
                  <th className={thClass}>고객사</th>
                  <th className={thClass}>유형</th>
                  <th className={`${thClass} hidden sm:table-cell`}>산업</th>
                  <th className={`${thClass} hidden md:table-cell`}>연 매출</th>
                  <th className={`${thClass} hidden md:table-cell`}>직원 수</th>
                  <th className={`${thClass} hidden lg:table-cell`}>휴대폰</th>
                  <th className={`${thClass} hidden lg:table-cell`}>담당자</th>
                  <th className={`${thClass} hidden lg:table-cell`}>웹사이트</th>
                  <th className={thClass}>작업</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    onClick={() => {
                      setSelectedAccountId(account.id);
                      setAccountForm({
                        name: account.name,
                        account_type: account.account_type ?? "Prospect",
                        industry: account.industry ?? "",
                        annual_revenue: account.annual_revenue ?? "",
                        employee_count: account.employee_count ?? 0,
                        phone: account.phone ?? "",
                        website: account.website ?? "",
                        address: account.address ?? "",
                        owner_id: account.owner_id ?? ""
                      });
                    }}
                    className={`${cherryHoverRowClass} cursor-pointer ${
                      selectedAccountId === account.id ? "bg-rose-50" : ""
                    }`}
                  >
                    <td className={`${tdClass} ${cherryTextClass}`}>{account.name}</td>
                    <td className={tdClass}>{account.account_type || "Prospect"}</td>
                    <td className={`${tdClass} hidden sm:table-cell`}>{account.industry || "-"}</td>
                    <td className={`${tdClass} hidden md:table-cell`}>
                      {account.annual_revenue ? money(account.annual_revenue) : "-"}
                    </td>
                    <td className={`${tdClass} hidden md:table-cell`}>
                      {account.employee_count ? `${formatter.format(account.employee_count)}명` : "-"}
                    </td>
                    <td className={`${tdClass} hidden lg:table-cell`}>{account.phone || "-"}</td>
                    <td className={`${tdClass} hidden lg:table-cell`}>{account.owner_id || "-"}</td>
                    <td className={`${tdClass} hidden lg:table-cell`}>{account.website || "-"}</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteAccount(account.id);
                          await onDataChanged();
                        }}
                        className="rounded border border-rose-200 px-2 py-1 text-xs font-bold text-rose-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <h3 className="text-lg font-bold">연락처 목록</h3>
            <span className="text-sm font-semibold text-slate-500">{contacts.length} rows</span>
          </div>
          <div className={tableScrollClass}>
            <table className={compactTableClass}>
              <thead>
                <tr>
                  <th className={thClass}>고객사</th>
                  <th className={thClass}>이름</th>
                  <th className={thClass}>직책</th>
                  <th className={`${thClass} hidden sm:table-cell`}>부서</th>
                  <th className={`${thClass} hidden md:table-cell`}>이메일</th>
                  <th className={`${thClass} hidden lg:table-cell`}>휴대폰</th>
                  <th className={`${thClass} hidden lg:table-cell`}>역할</th>
                  <th className={thClass}>작업</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setContactForm({
                        account_id: contact.account_id,
                        name: contact.name,
                        email: contact.email ?? "",
                        phone: contact.phone ?? "",
                        mobile_phone: contact.mobile_phone ?? "",
                        title: contact.title ?? "",
                        department: contact.department ?? "",
                        role_type: contact.role_type ?? "PRACTITIONER"
                      });
                    }}
                    className={`${cherryHoverRowClass} cursor-pointer ${
                      selectedContactId === contact.id ? "bg-rose-50" : ""
                    }`}
                  >
                    <td className={tdClass}>
                      {accounts.find((account) => account.id === contact.account_id)?.name || "-"}
                    </td>
                    <td className={`${tdClass} ${cherryTextClass}`}>{contact.name}</td>
                    <td className={tdClass}>{contact.title || "직책 미입력"}</td>
                    <td className={`${tdClass} hidden sm:table-cell`}>{contact.department || "-"}</td>
                    <td className={`${tdClass} hidden md:table-cell`}>{contact.email || "-"}</td>
                    <td className={`${tdClass} hidden lg:table-cell`}>
                      {contact.phone || "-"} / {contact.mobile_phone || "-"}
                    </td>
                    <td className={`${tdClass} hidden lg:table-cell`}>{contact.role_type || "-"}</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteContact(contact.id);
                          await onDataChanged();
                        }}
                        className="rounded border border-rose-200 px-2 py-1 text-xs font-bold text-rose-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
      </div>
    </section>
  );
}

function OpportunitySection({
  opportunities,
  accounts,
  onDataChanged
}: {
  opportunities: OpportunitySummary[];
  accounts: AccountSummary[];
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("");
  const [status, setStatus] = useState("");
  const selectedOpportunity = opportunities.find(
    (opportunity) => opportunity.id === selectedOpportunityId
  );
  const [form, setForm] = useState<OpportunityInput>({
    account_id: selectedOpportunity?.account_id ?? accounts[0]?.id ?? "",
    name: selectedOpportunity?.name ?? "",
    stage: selectedOpportunity?.stage ?? "LEAD",
    amount: selectedOpportunity?.amount ?? "0",
    expected_close_date: selectedOpportunity?.expected_close_date ?? "",
    owner_id: selectedOpportunity?.owner_name ?? "",
    opportunity_type: selectedOpportunity?.opportunity_type ?? "New Business",
    next_step: selectedOpportunity?.next_step ?? "",
    primary_campaign_source: selectedOpportunity?.primary_campaign_source ?? "",
    competitor: selectedOpportunity?.competitor ?? ""
  });

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setStatus(selectedOpportunity ? "영업기회 수정 중" : "영업기회 저장 중");
    try {
      const payload: OpportunityInput = {
        ...form,
        amount: digitsOnly(form.amount ?? "0") || "0"
      };
      if (selectedOpportunity) {
        await updateOpportunity(selectedOpportunity.id, payload);
        setStatus("영업기회를 수정했습니다.");
      } else {
        await createOpportunity(payload);
        setStatus("영업기회를 저장했습니다.");
        setForm((current) => ({ ...current, name: "", amount: "0", next_step: "", competitor: "" }));
      }
      await onDataChanged();
    } catch {
      setStatus("영업기회 저장 실패");
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="rounded-lg border border-line bg-white p-4" onSubmit={handleSave}>
        <h3 className="text-lg font-bold">{selectedOpportunity ? "영업기회 수정" : "영업기회 등록"}</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">
            고객사
            <select
              value={form.account_id}
              onChange={(event) => setForm((current) => ({ ...current, account_id: event.target.value }))}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            >
              <option value="">고객사 선택</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            영업기회
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="영업기회명"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              <EnumLabel
                label="현재 단계"
                hint="Lead→Qualified→Proposal→Negotiation→Won/Lost 순서로 진행됩니다."
              />
              <select
                value={form.stage}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stage: event.target.value as PipelineStage }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stageLabels[stage]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              예상 금액
              <input
                value={numberText(form.amount)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: digitsOnly(event.target.value) }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-right"
                placeholder="예상 금액"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              예상 마감일
              <input
                type="date"
                value={form.expected_close_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expected_close_date: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              <EnumLabel
                label="유형"
                hint="New Business: 신규 매출, Existing Business: 기존 고객 확장, Renewal: 재계약"
              />
              <select
                value={form.opportunity_type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, opportunity_type: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
              >
                <option value="New Business">New Business</option>
                <option value="Existing Business">Existing Business</option>
                <option value="Renewal">Renewal</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            다음 단계
            <input
              value={form.next_step}
              onChange={(event) => setForm((current) => ({ ...current, next_step: event.target.value }))}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="다음 단계"
            />
          </label>
          <button className="w-full rounded-md bg-rose-600 px-4 py-2 font-bold text-white">
            {selectedOpportunity ? "영업기회 수정" : "영업기회 저장"}
          </button>
          {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
        </div>
      </form>
      <div className={`${panelClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <h3 className="text-lg font-bold">영업기회 목록</h3>
          <span className="text-sm font-semibold text-slate-500">{opportunities.length} rows</span>
        </div>
        <div className={tableScrollClass}>
          <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                <th className={thClass}>영업기회</th>
                <th className={`${thClass} hidden md:table-cell`}>유형</th>
                <th className={thClass}>고객사</th>
                <th className={thClass}>현재 단계</th>
                <th className={thClass}>예상 금액</th>
                <th className={thClass}>Forecast</th>
                <th className={`${thClass} hidden lg:table-cell`}>다음 단계</th>
                <th className={`${thClass} hidden xl:table-cell`}>캠페인/경쟁사</th>
                <th className={thClass}>작업</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity) => (
                  <tr
                    key={opportunity.id}
                    onClick={() => {
                      setSelectedOpportunityId(opportunity.id);
                      setForm({
                        account_id: opportunity.account_id ?? "",
                        name: opportunity.name,
                        stage: opportunity.stage,
                        amount: opportunity.amount,
                        expected_close_date: opportunity.expected_close_date ?? "",
                        owner_id: opportunity.owner_name ?? "",
                        opportunity_type: opportunity.opportunity_type ?? "New Business",
                        next_step: opportunity.next_step ?? "",
                        primary_campaign_source: opportunity.primary_campaign_source ?? "",
                        competitor: opportunity.competitor ?? ""
                      });
                    }}
                    className={`${cherryHoverRowClass} cursor-pointer ${
                      selectedOpportunity?.id === opportunity.id ? "bg-rose-50" : ""
                    }`}
                  >
                    <td className={`${tdClass} ${cherryTextClass}`}>{opportunity.name}</td>
                    <td className={`${tdClass} hidden md:table-cell`}>
                      {opportunity.opportunity_type || "New Business"}
                    </td>
                    <td className={tdClass}>{opportunity.account_name ?? "고객사 미정"}</td>
                    <td className={tdClass}>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusPillClass(opportunity.stage)}`}>
                        {stageLabels[opportunity.stage]}
                      </span>
                    </td>
                    <td className={tdClass}>{money(opportunity.amount)}</td>
                    <td className={tdClass}>{money(opportunity.forecast_amount)}</td>
                    <td className={`${tdClass} hidden lg:table-cell`}>{opportunity.next_step || "-"}</td>
                    <td className={`${tdClass} hidden xl:table-cell`}>
                      {opportunity.primary_campaign_source || "-"}
                      {opportunity.competitor ? ` / ${opportunity.competitor}` : ""}
                    </td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedOpportunityId(opportunity.id);
                          setForm({
                            account_id: opportunity.account_id ?? "",
                            name: opportunity.name,
                            stage: opportunity.stage,
                            amount: opportunity.amount,
                            expected_close_date: opportunity.expected_close_date ?? "",
                            owner_id: opportunity.owner_name ?? "",
                            opportunity_type: opportunity.opportunity_type ?? "New Business",
                            next_step: opportunity.next_step ?? "",
                            primary_campaign_source: opportunity.primary_campaign_source ?? "",
                            competitor: opportunity.competitor ?? ""
                          });
                        }}
                        className="rounded border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700"
                      >
                        선택
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ActivitySection({
  activities,
  opportunities,
  leads,
  onDataChanged
}: {
  activities: ActivitySummary[];
  opportunities: OpportunitySummary[];
  leads: LeadSummary[];
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const selectedActivity = activities.find((activity) => activity.id === selectedActivityId);
  const [form, setForm] = useState<ActivityInput>({
    subject: selectedActivity?.subject ?? "",
    activity_type: selectedActivity?.activity_type ?? "CALL",
    activity_date: selectedActivity
      ? new Date(selectedActivity.activity_date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    due_date: selectedActivity?.due_date ?? "",
    status: selectedActivity?.status ?? "OPEN",
    priority: selectedActivity?.priority ?? "MEDIUM",
    description: selectedActivity?.description ?? "",
    opportunity_id: selectedActivity?.opportunity_id ?? opportunities[0]?.id ?? "",
    lead_id: selectedActivity?.lead_id ?? ""
  });
  const [status, setStatus] = useState("");

  async function handleCreateActivity(event: FormEvent) {
    event.preventDefault();
    setStatus("활동 저장 중");
    try {
      const payload = {
        activity_type: form.activity_type,
        subject: form.subject,
        activity_date: new Date(form.activity_date).toISOString(),
        due_date: form.due_date || undefined,
        status: form.status,
        priority: form.priority,
        description: form.description,
        opportunity_id: form.opportunity_id || undefined,
        lead_id: form.lead_id || undefined
      };
      if (selectedActivity) {
        await updateActivity(selectedActivity.id, payload);
        setStatus("활동을 수정했습니다.");
      } else {
        await createActivity(payload);
        setForm((current) => ({ ...current, subject: "", description: "" }));
        setStatus("활동을 저장했습니다.");
      }
      await onDataChanged();
    } catch {
      setStatus("활동 저장 실패");
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="rounded-lg border border-line bg-white p-4" onSubmit={handleCreateActivity}>
        <h3 className="text-lg font-bold">{selectedActivity ? "활동 수정" : "활동 등록"}</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">
            제목
            <input
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="제목"
            />
          </label>
          <label className="block text-sm font-medium">
            <EnumLabel
              label="유형"
              hint="휴대폰, 미팅, 이메일, 제안서 송부, 후속 연락 중에서 활동 유형을 선택합니다."
            />
            <select
              value={form.activity_type}
              onChange={(event) =>
                setForm((current) => ({ ...current, activity_type: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            >
              <option value="CALL">휴대폰</option>
              <option value="MEETING">미팅</option>
              <option value="EMAIL">이메일</option>
              <option value="PROPOSAL_SENT">제안서 송부</option>
              <option value="FOLLOW_UP">후속 연락</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            일시
            <input
              type="datetime-local"
              value={form.activity_date}
              onChange={(event) =>
                setForm((current) => ({ ...current, activity_date: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm font-medium">
              기한
              <input
                type="date"
                value={form.due_date}
                onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))}
                className="mt-1 w-full min-w-0 rounded-md border border-line px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              <EnumLabel label="상태" hint="Open: 시작 전, In Progress: 진행 중, Done: 완료" />
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="mt-1 w-full min-w-0 rounded-md border border-line px-3 py-2"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              <EnumLabel label="우선순위" hint="High, Medium, Low 우선순위로 활동 중요도를 설정합니다." />
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="mt-1 w-full min-w-0 rounded-md border border-line px-3 py-2"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            영업기회
            <select
              value={form.opportunity_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  opportunity_id: event.target.value,
                  lead_id: ""
                }))
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            >
              <option value="">영업기회 선택 없음</option>
              {opportunities.map((opportunity) => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            리드
            <select
              value={form.lead_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  lead_id: event.target.value,
                  opportunity_id: ""
                }))
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            >
              <option value="">리드 선택 없음</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.company_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            내용
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="mt-1 min-h-24 w-full rounded-md border border-line px-3 py-2"
              placeholder="활동 내용"
            />
          </label>
          <button className="w-full rounded-md bg-rose-600 px-4 py-2 font-bold text-white">
            {selectedActivity ? "활동 수정" : "활동 저장"}
          </button>
          {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
        </div>
      </form>
      <div className={`${panelClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <h3 className="text-lg font-bold">활동 목록</h3>
          <span className="text-sm font-semibold text-slate-500">{activities.length} rows</span>
        </div>
        <div className={tableScrollClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>유형</th>
                <th className={thClass}>제목</th>
                <th className={thClass}>일시</th>
                <th className={`${thClass} hidden md:table-cell`}>기한</th>
                <th className={`${thClass} hidden lg:table-cell`}>상태/우선순위</th>
                <th className={`${thClass} hidden xl:table-cell`}>내용</th>
                <th className={`${thClass} hidden lg:table-cell`}>담당</th>
                <th className={thClass}>작업</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  onClick={() => {
                    setSelectedActivityId(activity.id);
                    setForm({
                      subject: activity.subject ?? "",
                      activity_type: activity.activity_type,
                      activity_date: new Date(activity.activity_date).toISOString().slice(0, 16),
                      due_date: activity.due_date ?? "",
                      status: activity.status ?? "OPEN",
                      priority: activity.priority ?? "MEDIUM",
                      description: activity.description ?? "",
                      opportunity_id: activity.opportunity_id ?? "",
                      lead_id: activity.lead_id ?? ""
                    });
                  }}
                  className={`${cherryHoverRowClass} cursor-pointer ${
                    selectedActivityId === activity.id ? "bg-rose-50" : ""
                  }`}
                >
                  <td className={`${tdClass} ${cherryTextClass}`}>{activity.activity_type}</td>
                  <td className={tdClass}>{activity.subject || "제목 없음"}</td>
                  <td className={tdClass}>{new Date(activity.activity_date).toLocaleString("ko-KR")}</td>
                  <td className={`${tdClass} hidden md:table-cell`}>{activity.due_date || "-"}</td>
                  <td className={`${tdClass} hidden lg:table-cell`}>
                    {activity.status || "OPEN"} / {activity.priority || "MEDIUM"}
                  </td>
                  <td className={`${tdClass} hidden xl:table-cell`}>{activity.description || "내용 없음"}</td>
                  <td className={`${tdClass} hidden lg:table-cell`}>{activity.owner_id || "-"}</td>
                  <td className={tdClass}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await updateActivity(activity.id, { description: "후속 조치 필요" });
                          await onDataChanged();
                        }}
                        className="rounded border border-slate-200 px-2 py-1 text-xs font-bold"
                      >
                        후속
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteActivity(activity.id);
                          await onDataChanged();
                        }}
                        className="rounded border border-rose-200 px-2 py-1 text-xs font-bold text-rose-600"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ReportSection({ reports }: { reports: DashboardReports }) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Target}
          label="홈페이지 리드"
          value={`${reports.integration.website_leads}건`}
          tone="mint"
        />
        <MetricCard
          icon={Flame}
          label="챗봇 리드"
          value={`${reports.integration.chatbot_leads}건`}
          tone="coral"
        />
        <MetricCard
          icon={Activity}
          label="담당자 활동"
          value={`${reports.activities_by_owner.length}명`}
          tone="ink"
        />
        <MetricCard
          icon={TrendingUp}
          label="리포트 단계"
          value={`${reports.pipeline.length}개`}
          tone="gold"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-4">
          <h3 className="text-lg font-bold">채널 성과 리포트</h3>
          <div className="mt-4 space-y-3">
            {reports.channels.map((channel) => (
              <article key={channel.source_channel} className="rounded-md border border-line p-4">
                <strong>{channel.source_channel}</strong>
                <p className="mt-2 text-sm text-slate-600">
                  리드 {channel.lead_count}건 · Hot Lead {channel.hot_lead_count}건
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-white p-4">
          <h3 className="text-lg font-bold">담당자 활동 리포트</h3>
          <div className="mt-4 space-y-3">
            {reports.activities_by_owner.map((row) => (
              <article key={row.owner_id} className="rounded-md border border-line p-4">
                <strong>{row.owner_id}</strong>
                <p className="mt-2 text-sm text-slate-600">활동 {row.activity_count}건</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function IntegrationSection({ onDataChanged }: { onDataChanged: DashboardProps["onDataChanged"] }) {
  const [channel, setChannel] = useState<"web" | "chatbot">("web");
  const [form, setForm] = useState<IntegrationLeadInput>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    source_channel: "website",
    inquiry_content: "",
    budget_confirmed: false,
    authority_confirmed: false,
    timeline_within_3_months: false,
    price_page_visit_count: 0,
    downloaded_material: false,
    raw_payload: {}
  });
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("연동 리드 인입 중");
    try {
      await createIntegrationLead(channel, {
        ...form,
        raw_payload: { channel, received_from: "admin_integration_screen", ...form.raw_payload },
        chatbot_log: channel === "chatbot" ? { intent: "sales_inquiry" } : undefined
      });
      setStatus("연동 리드를 생성했습니다.");
      await onDataChanged();
    } catch {
      setStatus("연동 리드 생성 실패: API Key 또는 서버 상태를 확인해주세요.");
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="rounded-lg border border-line bg-white p-4" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold">연동 리드 테스트</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">
            <EnumLabel
              label="연동 채널"
              hint="홈페이지: 웹 폼 유입, 챗봇: 챗봇 상담 유입"
            />
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value as "web" | "chatbot")}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            >
              <option value="web">홈페이지</option>
              <option value="chatbot">챗봇</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            고객사
            <input
              required
              value={form.company_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, company_name: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="고객사명"
            />
          </label>
          <label className="block text-sm font-medium">
            담당자
            <input
              required
              value={form.contact_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, contact_name: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="담당자명"
            />
          </label>
          <label className="block text-sm font-medium">
            문의 내용
            <textarea
              value={form.inquiry_content}
              onChange={(event) =>
                setForm((current) => ({ ...current, inquiry_content: event.target.value }))
              }
              className="mt-1 min-h-24 w-full rounded-md border border-line px-3 py-2"
              placeholder="원문 문의 내용"
            />
          </label>
          <button className="w-full rounded-md bg-rose-600 px-4 py-2 font-bold text-white">
            연동 리드 생성
          </button>
          {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
        </div>
      </form>
      <div className="rounded-lg border border-line bg-white p-4">
        <h3 className="text-lg font-bold">연동 운영 기준</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["인증", "X-API-Key 헤더로 홈페이지/챗봇 인입을 보호합니다."],
            ["원문 저장", "raw_payload와 chatbot_log를 리드에 함께 저장합니다."],
            ["감사 로그", "integration actor로 리드 생성 기록을 남깁니다."],
            ["후속 처리", "인입 후 리드 상세 화면에서 영업기회로 전환합니다."]
          ].map(([title, description]) => (
            <article key={title} className="rounded-md border border-line p-4">
              <strong>{title}</strong>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminSection({
  settings,
  rolePolicies,
  onDataChanged
}: {
  settings: AdminSettings;
  rolePolicies: RolePolicy[];
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const [probabilities, setProbabilities] = useState<Record<PipelineStage, number>>(
    settings.stage_probabilities
  );
  const [status, setStatus] = useState("");

  async function handleSave() {
    setStatus("관리자 설정 저장 중");
    try {
      await updateAdminSettings({ ...settings, stage_probabilities: probabilities });
      setStatus("관리자 설정을 저장했습니다.");
      await onDataChanged();
    } catch {
      setStatus("관리자 설정 저장 실패");
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-line bg-white p-4">
        <h3 className="text-lg font-bold">관리자 설정</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage) => (
            <label
              key={stage}
              className="block rounded-md border border-line p-4 text-sm font-medium"
            >
              {stageLabels[stage]} 확률
              <input
                type="number"
                min="0"
                max="100"
                value={probabilities[stage]}
                onChange={(event) =>
                  setProbabilities((current) => ({
                    ...current,
                    [stage]: Number(event.target.value)
                  }))
                }
                className="mt-2 w-full rounded-md border border-line px-3 py-2"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white"
        >
          관리자 설정 저장
        </button>
        {status && <p className="mt-3 text-sm font-medium text-slate-700">{status}</p>}
      </div>
      <div className="rounded-lg border border-line bg-white p-4">
        <h3 className="text-lg font-bold">운영 정책</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rolePolicies.map((policy) => (
            <article key={policy.role} className="rounded-md border border-line p-4">
              <strong>{policy.role}</strong>
              <p className="mt-2 text-sm text-slate-600">{policy.data_scope}</p>
              <p className="mt-1 text-xs font-bold text-mint">{policy.permissions.join(", ")}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Dashboard({
  kpis,
  pipeline,
  leads,
  opportunities,
  accounts,
  contacts,
  activities,
  reports,
  adminSettings,
  rolePolicies,
  usingMockData,
  onCreateLead,
  onDataChanged
}: DashboardProps) {
  const [activeView, setActiveView] = useState<MenuItem>("대시보드");

  function menuClass(item: MenuItem) {
    return item === activeView
      ? "bg-rose-600 text-white"
      : "bg-transparent text-ink hover:bg-white";
  }

  return (
    <main className="min-h-screen bg-[#fff7f8] text-ink">
      <div className="mx-auto flex max-w-[1440px] gap-0 px-4 py-4 sm:px-6">
        <aside className="hidden w-64 shrink-0 rounded-l-md border border-rose-950/10 bg-[#2a0f18] p-4 text-white shadow-sm lg:block">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200">Cherrylab</p>
            <h1 className="mt-1 text-2xl font-bold">Cherrysales</h1>
          </div>
          <nav className="mt-7 space-y-1 text-base">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveView(item)}
                className={`flex w-full items-center rounded-md px-3 py-2.5 text-left font-semibold ${
                  item === activeView
                    ? "bg-rose-500 text-white"
                    : "bg-transparent text-slate-200 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 rounded-r-md border border-l-0 border-rose-100 bg-white/80 p-4 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <p className="text-sm font-bold text-rose-700">Cherrylab Sales Cloud</p>
              <h2 className="text-2xl font-bold">Cherrysales</h2>
            </div>
            <div className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              MVP Workspace
            </div>
          </header>

          {usingMockData && (
            <div className="mt-4 rounded-md border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm text-ink">
              API 서버 연결 전이라 샘플 데이터로 화면을 표시하고 있습니다.
            </div>
          )}

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="모바일 메뉴">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveView(item)}
                className={`shrink-0 rounded-md px-3 py-2 text-base font-semibold ${menuClass(item)}`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-4">
            {activeView === "대시보드" && (
              <DashboardHome
                kpis={kpis}
                pipeline={pipeline}
                leads={leads}
                opportunities={opportunities}
                reports={reports}
              />
            )}
            {activeView === "리드" && (
              <LeadSection
                leads={leads}
                onCreateLead={onCreateLead}
                onDataChanged={onDataChanged}
              />
            )}
            {activeView === "고객사" && (
              <AccountSection
                accounts={accounts}
                contacts={contacts}
                onDataChanged={onDataChanged}
              />
            )}
            {activeView === "영업기회" && (
              <OpportunitySection
                opportunities={opportunities}
                accounts={accounts}
                onDataChanged={onDataChanged}
              />
            )}
            {activeView === "활동" && (
              <ActivitySection
                activities={activities}
                opportunities={opportunities}
                leads={leads}
                onDataChanged={onDataChanged}
              />
            )}
            {activeView === "리포트" && <ReportSection reports={reports} />}
            {activeView === "연동" && <IntegrationSection onDataChanged={onDataChanged} />}
            {activeView === "관리자" && (
              <AdminSection
                settings={adminSettings}
                rolePolicies={rolePolicies}
                onDataChanged={onDataChanged}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
