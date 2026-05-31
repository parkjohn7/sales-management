import { Activity, Check, Flame, Target, TrendingUp } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  changeOpportunityStage,
  convertLead,
  createAccount,
  createActivity,
  createContact,
  createIntegrationLead,
  deleteAccount,
  deleteActivity,
  deleteContact,
  updateAdminSettings,
  updateAccount,
  updateActivity,
  updateContact
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
  OpportunityStageChangeInput,
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
  onConnectDevToken: () => void;
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

function gradeClass(grade: LeadSummary["lead_grade"]) {
  if (grade === "HOT") return "bg-coral/10 text-coral";
  if (grade === "WARM") return "bg-gold/10 text-gold";
  return "bg-ink/10 text-ink";
}

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
  if (stage === "CLOSED_LOST") return "border-coral bg-coral/10";
  if (stage === "NEGOTIATION") return "border-gold bg-gold/10";
  return "border-line bg-white";
}

function MobileSalesEntry({ onCreateLead }: { onCreateLead: DashboardProps["onCreateLead"] }) {
  const [form, setForm] = useState<LeadCreateInput>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    source_channel: "mobile",
    inquiry_content: "",
    budget_confirmed: false,
    authority_confirmed: false,
    timeline_within_3_months: false,
    price_page_visit_count: 0,
    downloaded_material: false
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update<K extends keyof LeadCreateInput>(key: K, value: LeadCreateInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("saving");
    try {
      await onCreateLead(form);
      setForm((current) => ({
        ...current,
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        inquiry_content: "",
        budget_confirmed: false,
        authority_confirmed: false,
        timeline_within_3_months: false,
        downloaded_material: false
      }));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-line bg-white p-4 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold">모바일 리드 입력</h3>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-mint/10 px-2 py-1 text-xs font-bold text-mint">
            <Check className="h-3 w-3" aria-hidden="true" />
            저장됨
          </span>
        )}
      </div>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">
          고객사
          <input
            required
            value={form.company_name}
            onChange={(event) => update("company_name", event.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-3 text-base"
            placeholder="예: 체리랩"
          />
        </label>
        <label className="block text-sm font-medium">
          담당자
          <input
            required
            value={form.contact_name}
            onChange={(event) => update("contact_name", event.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-3 text-base"
            placeholder="예: 김매니저"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            이메일
            <input
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-base"
            />
          </label>
          <label className="block text-sm font-medium">
            전화
            <input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-base"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          문의 내용
          <textarea
            value={form.inquiry_content}
            onChange={(event) => update("inquiry_content", event.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border border-line px-3 py-3 text-base"
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
          className="w-full rounded-md bg-mint px-4 py-3 text-base font-bold text-white disabled:opacity-60"
        >
          {status === "saving" ? "저장 중" : "리드 저장"}
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
    <section className="mt-5 rounded-lg border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold">사업별 스테이지 매핑</h3>
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

function LeadSection({
  leads,
  onCreateLead,
  onDataChanged
}: {
  leads: LeadSummary[];
  onCreateLead: DashboardProps["onCreateLead"];
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [convertForm, setConvertForm] = useState({ opportunity_name: "", amount: "0" });
  const [status, setStatus] = useState("");
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];

  async function handleConvert(event: FormEvent) {
    event.preventDefault();
    if (!selectedLead) return;
    setStatus("전환 중");
    try {
      await convertLead(selectedLead.id, convertForm);
      setStatus("고객사/연락처/영업기회로 전환되었습니다.");
      await onDataChanged();
    } catch {
      setStatus("전환 실패: API 연결 또는 이미 전환된 리드인지 확인해주세요.");
    }
  }

  return (
    <section className="space-y-5">
      <MobileSalesEntry onCreateLead={onCreateLead} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-line bg-white p-5">
        <h3 className="text-base font-bold">리드 목록</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {leads.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => setSelectedLeadId(lead.id)}
              className={`rounded-md border p-4 text-left ${
                selectedLead?.id === lead.id ? "border-mint bg-mint/5" : "border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <strong>{lead.company_name}</strong>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${gradeClass(
                    lead.lead_grade
                  )}`}
                >
                  {lead.lead_grade}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {lead.contact_name} · {lead.source_channel}
              </p>
              <p className="mt-1 text-sm font-medium">
                {lead.lead_score}점 · {lead.status}
              </p>
            </button>
          ))}
        </div>
      </div>
        <aside className="rounded-lg border border-line bg-white p-5">
          <h3 className="text-base font-bold">리드 상세/전환</h3>
          {selectedLead ? (
            <>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">고객사</dt>
                  <dd className="font-bold">{selectedLead.company_name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">담당자</dt>
                  <dd>{selectedLead.contact_name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">점수/등급</dt>
                  <dd>
                    {selectedLead.lead_score}점 · {selectedLead.lead_grade}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">문의</dt>
                  <dd>{selectedLead.inquiry_content || "문의 내용 없음"}</dd>
                </div>
              </dl>
              <form className="mt-5 space-y-3" onSubmit={handleConvert}>
                <label className="block text-sm font-medium">
                  영업기회명
                  <input
                    value={convertForm.opportunity_name}
                    onChange={(event) =>
                      setConvertForm((current) => ({
                        ...current,
                        opportunity_name: event.target.value
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-line px-3 py-2"
                    placeholder={`${selectedLead.company_name} 도입`}
                  />
                </label>
                <label className="block text-sm font-medium">
                  예상 금액
                  <input
                    type="number"
                    min="0"
                    value={convertForm.amount}
                    onChange={(event) =>
                      setConvertForm((current) => ({ ...current, amount: event.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  />
                </label>
                <button className="w-full rounded-md bg-mint px-4 py-2 font-bold text-white">
                  고객사/영업기회 전환
                </button>
                {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
              </form>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-600">전환할 리드가 없습니다.</p>
          )}
        </aside>
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
  const [accountForm, setAccountForm] = useState<AccountInput>({
    name: "",
    industry: "",
    website: "",
    address: ""
  });
  const [contactForm, setContactForm] = useState<ContactInput>({
    account_id: accounts[0]?.id ?? "",
    name: "",
    email: "",
    phone: "",
    title: "",
    role_type: "PRACTITIONER"
  });
  const [status, setStatus] = useState("");

  async function handleCreateAccount(event: FormEvent) {
    event.preventDefault();
    setStatus("고객사 저장 중");
    try {
      await createAccount(accountForm);
      setAccountForm({ name: "", industry: "", website: "", address: "" });
      setStatus("고객사를 저장했습니다.");
      await onDataChanged();
    } catch {
      setStatus("고객사 저장 실패");
    }
  }

  async function handleCreateContact(event: FormEvent) {
    event.preventDefault();
    setStatus("연락처 저장 중");
    try {
      await createContact(contactForm);
      setContactForm((current) => ({
        ...current,
        name: "",
        email: "",
        phone: "",
        title: ""
      }));
      setStatus("연락처를 저장했습니다.");
      await onDataChanged();
    } catch {
      setStatus("연락처 저장 실패: 고객사를 선택해주세요.");
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-5">
        <form className="rounded-lg border border-line bg-white p-5" onSubmit={handleCreateAccount}>
          <h3 className="text-base font-bold">고객사 등록</h3>
          <div className="mt-4 space-y-3">
            <input
              required
              value={accountForm.name}
              onChange={(event) =>
                setAccountForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2"
              placeholder="고객사명"
            />
            <input
              value={accountForm.industry}
              onChange={(event) =>
                setAccountForm((current) => ({ ...current, industry: event.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2"
              placeholder="산업"
            />
            <input
              value={accountForm.website}
              onChange={(event) =>
                setAccountForm((current) => ({ ...current, website: event.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2"
              placeholder="웹사이트"
            />
            <button className="w-full rounded-md bg-mint px-4 py-2 font-bold text-white">
              고객사 저장
            </button>
          </div>
        </form>
        <form className="rounded-lg border border-line bg-white p-5" onSubmit={handleCreateContact}>
          <h3 className="text-base font-bold">연락처 등록</h3>
          <div className="mt-4 space-y-3">
            <select
              required
              value={contactForm.account_id}
              onChange={(event) =>
                setContactForm((current) => ({ ...current, account_id: event.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2"
            >
              <option value="">고객사 선택</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input
              required
              value={contactForm.name}
              onChange={(event) =>
                setContactForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2"
              placeholder="이름"
            />
            <input
              value={contactForm.email}
              onChange={(event) =>
                setContactForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2"
              placeholder="이메일"
            />
            <input
              value={contactForm.title}
              onChange={(event) =>
                setContactForm((current) => ({ ...current, title: event.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2"
              placeholder="직책"
            />
            <button className="w-full rounded-md bg-ink px-4 py-2 font-bold text-white">
              연락처 저장
            </button>
          </div>
        </form>
      </div>
      <div className="space-y-5">
        <section className="rounded-lg border border-line bg-white p-5">
          <h3 className="text-base font-bold">고객사 CRUD</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {accounts.map((account) => (
              <article key={account.id} className="rounded-md border border-line p-4">
                <input
                  defaultValue={account.name}
                  onBlur={async (event) => {
                    if (event.target.value !== account.name) {
                      await updateAccount(account.id, { name: event.target.value });
                      await onDataChanged();
                    }
                  }}
                  className="w-full rounded-md border border-line px-3 py-2 font-bold"
                />
                <p className="mt-2 text-sm text-slate-600">{account.industry || "산업 미입력"}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteAccount(account.id);
                    await onDataChanged();
                  }}
                  className="mt-3 rounded-md border border-coral px-3 py-2 text-sm font-bold text-coral"
                >
                  삭제
                </button>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-white p-5">
          <h3 className="text-base font-bold">연락처 CRUD</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {contacts.map((contact) => (
              <article key={contact.id} className="rounded-md border border-line p-4">
                <input
                  defaultValue={contact.name}
                  onBlur={async (event) => {
                    if (event.target.value !== contact.name) {
                      await updateContact(contact.id, { name: event.target.value });
                      await onDataChanged();
                    }
                  }}
                  className="w-full rounded-md border border-line px-3 py-2 font-bold"
                />
                <p className="mt-2 text-sm text-slate-600">
                  {contact.title || "직책 미입력"} · {contact.email || "이메일 없음"}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteContact(contact.id);
                    await onDataChanged();
                  }}
                  className="mt-3 rounded-md border border-coral px-3 py-2 text-sm font-bold text-coral"
                >
                  삭제
                </button>
              </article>
            ))}
          </div>
        </section>
        {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
      </div>
    </section>
  );
}

function OpportunitySection({
  opportunities,
  leads,
  onDataChanged
}: {
  opportunities: OpportunitySummary[];
  leads: LeadSummary[];
  onDataChanged: DashboardProps["onDataChanged"];
}) {
  const [stageForms, setStageForms] = useState<Record<string, OpportunityStageChangeInput>>({});
  const [status, setStatus] = useState("");

  function formFor(opportunity: OpportunitySummary): OpportunityStageChangeInput {
    return stageForms[opportunity.id] ?? { stage: opportunity.stage, reason: "" };
  }

  async function handleStageChange(event: FormEvent, opportunity: OpportunitySummary) {
    event.preventDefault();
    const form = formFor(opportunity);
    setStatus("단계 변경 중");
    try {
      await changeOpportunityStage(opportunity.id, form);
      setStatus("영업기회 단계가 변경되었습니다.");
      await onDataChanged();
    } catch {
      setStatus("단계 변경 실패: Lost 단계는 사유가 필요합니다.");
    }
  }

  return (
    <section className="space-y-5">
      <StageMatrix opportunities={opportunities} leads={leads} />
      <div className="rounded-lg border border-line bg-white p-5">
        <h3 className="text-base font-bold">영업기회 상세</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.map((opportunity) => {
            const form = formFor(opportunity);
            return (
            <article key={opportunity.id} className="rounded-md border border-line p-4">
              <div className="text-xs font-bold text-mint">{stageLabels[opportunity.stage]}</div>
              <strong className="mt-1 block">{opportunity.name}</strong>
              <p className="mt-2 text-sm text-slate-600">
                {opportunity.account_name ?? "고객사 미정"} · {opportunity.owner_name ?? "담당자 미정"}
              </p>
              <p className="mt-2 text-sm">
                {money(opportunity.amount)} · Forecast {money(opportunity.forecast_amount)}
              </p>
              <form className="mt-4 space-y-2" onSubmit={(event) => handleStageChange(event, opportunity)}>
                <label className="block text-sm font-medium">
                  단계 변경
                  <select
                    value={form.stage}
                    onChange={(event) =>
                      setStageForms((current) => ({
                        ...current,
                        [opportunity.id]: {
                          ...form,
                          stage: event.target.value as PipelineStage
                        }
                      }))
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
                <input
                  value={form.reason ?? ""}
                  onChange={(event) =>
                    setStageForms((current) => ({
                      ...current,
                      [opportunity.id]: { ...form, reason: event.target.value }
                    }))
                  }
                  className="w-full rounded-md border border-line px-3 py-2 text-sm"
                  placeholder="변경 사유"
                />
                {form.stage === "CLOSED_LOST" && (
                  <input
                    value={form.lost_reason ?? ""}
                    onChange={(event) =>
                      setStageForms((current) => ({
                        ...current,
                        [opportunity.id]: { ...form, lost_reason: event.target.value }
                      }))
                    }
                    className="w-full rounded-md border border-line px-3 py-2 text-sm"
                    placeholder="Lost 사유"
                    required
                  />
                )}
                <button className="w-full rounded-md border border-mint px-3 py-2 text-sm font-bold text-mint">
                  단계 저장
                </button>
              </form>
            </article>
          )})}
        </div>
        {status && <p className="mt-3 text-sm font-medium text-slate-700">{status}</p>}
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
  const [form, setForm] = useState<ActivityInput>({
    activity_type: "CALL",
    activity_date: new Date().toISOString().slice(0, 16),
    description: "",
    opportunity_id: opportunities[0]?.id ?? "",
    lead_id: ""
  });
  const [status, setStatus] = useState("");

  async function handleCreateActivity(event: FormEvent) {
    event.preventDefault();
    setStatus("활동 저장 중");
    try {
      await createActivity({
        activity_type: form.activity_type,
        activity_date: new Date(form.activity_date).toISOString(),
        description: form.description,
        opportunity_id: form.opportunity_id || undefined,
        lead_id: form.lead_id || undefined
      });
      setForm((current) => ({ ...current, description: "" }));
      setStatus("활동을 저장했습니다.");
      await onDataChanged();
    } catch {
      setStatus("활동 저장 실패");
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="rounded-lg border border-line bg-white p-5" onSubmit={handleCreateActivity}>
        <h3 className="text-base font-bold">활동 등록</h3>
        <div className="mt-4 space-y-3">
          <select
            value={form.activity_type}
            onChange={(event) =>
              setForm((current) => ({ ...current, activity_type: event.target.value }))
            }
            className="w-full rounded-md border border-line px-3 py-2"
          >
            <option value="CALL">전화</option>
            <option value="MEETING">미팅</option>
            <option value="EMAIL">이메일</option>
            <option value="PROPOSAL_SENT">제안서 송부</option>
            <option value="FOLLOW_UP">후속 연락</option>
          </select>
          <input
            type="datetime-local"
            value={form.activity_date}
            onChange={(event) =>
              setForm((current) => ({ ...current, activity_date: event.target.value }))
            }
            className="w-full rounded-md border border-line px-3 py-2"
          />
          <select
            value={form.opportunity_id}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                opportunity_id: event.target.value,
                lead_id: ""
              }))
            }
            className="w-full rounded-md border border-line px-3 py-2"
          >
            <option value="">영업기회 선택 없음</option>
            {opportunities.map((opportunity) => (
              <option key={opportunity.id} value={opportunity.id}>
                {opportunity.name}
              </option>
            ))}
          </select>
          <select
            value={form.lead_id}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                lead_id: event.target.value,
                opportunity_id: ""
              }))
            }
            className="w-full rounded-md border border-line px-3 py-2"
          >
            <option value="">리드 선택 없음</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.company_name}
              </option>
            ))}
          </select>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            className="min-h-24 w-full rounded-md border border-line px-3 py-2"
            placeholder="활동 내용"
          />
          <button className="w-full rounded-md bg-mint px-4 py-2 font-bold text-white">
            활동 저장
          </button>
          {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
        </div>
      </form>
      <div className="rounded-lg border border-line bg-white p-5">
        <h3 className="text-base font-bold">활동 목록</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {activities.map((activity) => (
            <article key={activity.id} className="rounded-md border border-line p-4">
              <strong>{activity.activity_type}</strong>
              <p className="mt-2 text-sm text-slate-600">{activity.description || "내용 없음"}</p>
              <p className="mt-1 text-xs font-bold text-mint">
                {new Date(activity.activity_date).toLocaleString("ko-KR")}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await updateActivity(activity.id, { description: "후속 조치 필요" });
                    await onDataChanged();
                  }}
                  className="rounded-md border border-line px-3 py-2 text-sm font-bold"
                >
                  후속 표시
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteActivity(activity.id);
                    await onDataChanged();
                  }}
                  className="rounded-md border border-coral px-3 py-2 text-sm font-bold text-coral"
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportSection({ reports }: { reports: DashboardReports }) {
  return (
    <section className="space-y-5">
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
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5">
          <h3 className="text-base font-bold">채널 성과 리포트</h3>
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
        <section className="rounded-lg border border-line bg-white p-5">
          <h3 className="text-base font-bold">담당자 활동 리포트</h3>
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
    <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="rounded-lg border border-line bg-white p-5" onSubmit={handleSubmit}>
        <h3 className="text-base font-bold">연동 리드 테스트</h3>
        <div className="mt-4 space-y-3">
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value as "web" | "chatbot")}
            className="w-full rounded-md border border-line px-3 py-2"
          >
            <option value="web">홈페이지</option>
            <option value="chatbot">챗봇</option>
          </select>
          <input
            required
            value={form.company_name}
            onChange={(event) =>
              setForm((current) => ({ ...current, company_name: event.target.value }))
            }
            className="w-full rounded-md border border-line px-3 py-2"
            placeholder="고객사명"
          />
          <input
            required
            value={form.contact_name}
            onChange={(event) =>
              setForm((current) => ({ ...current, contact_name: event.target.value }))
            }
            className="w-full rounded-md border border-line px-3 py-2"
            placeholder="담당자명"
          />
          <textarea
            value={form.inquiry_content}
            onChange={(event) =>
              setForm((current) => ({ ...current, inquiry_content: event.target.value }))
            }
            className="min-h-24 w-full rounded-md border border-line px-3 py-2"
            placeholder="원문 문의 내용"
          />
          <button className="w-full rounded-md bg-mint px-4 py-2 font-bold text-white">
            연동 리드 생성
          </button>
          {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
        </div>
      </form>
      <div className="rounded-lg border border-line bg-white p-5">
        <h3 className="text-base font-bold">연동 운영 기준</h3>
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
    <section className="space-y-5">
      <div className="rounded-lg border border-line bg-white p-5">
        <h3 className="text-base font-bold">관리자 설정</h3>
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
          className="mt-4 rounded-md bg-mint px-4 py-2 text-sm font-bold text-white"
        >
          관리자 설정 저장
        </button>
        {status && <p className="mt-3 text-sm font-medium text-slate-700">{status}</p>}
      </div>
      <div className="rounded-lg border border-line bg-white p-5">
        <h3 className="text-base font-bold">운영 정책</h3>
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
  onConnectDevToken,
  onCreateLead,
  onDataChanged
}: DashboardProps) {
  const [activeView, setActiveView] = useState<MenuItem>("대시보드");

  function menuClass(item: MenuItem) {
    return item === activeView
      ? "bg-mint text-white"
      : "bg-transparent text-ink hover:bg-white";
  }

  return (
    <main className="min-h-screen bg-[#f5f7f8] text-ink">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="hidden w-60 shrink-0 border-r border-line pr-5 lg:block">
          <h1 className="text-xl font-bold">영업관리시스템</h1>
          <nav className="mt-8 space-y-1 text-sm">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveView(item)}
                className={`flex w-full items-center rounded-md px-3 py-2 text-left ${menuClass(item)}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-mint">Pipeline, Forecast, Follow-up</p>
              <h2 className="text-2xl font-bold">영업 현황</h2>
            </div>
            <button
              onClick={onConnectDevToken}
              className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium hover:border-mint"
            >
              개발 토큰 연결
            </button>
          </header>

          {usingMockData && (
            <div className="mt-4 rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
              API 서버 연결 전이라 샘플 데이터로 화면을 표시하고 있습니다.
            </div>
          )}

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="모바일 메뉴">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveView(item)}
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${menuClass(item)}`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-5">
            {activeView === "대시보드" && (
              <>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    icon={Flame}
                    label="Hot Lead"
                    value={`${kpis.hot_leads}건`}
                    tone="coral"
                  />
                  <MetricCard
                    icon={Target}
                    label="신규 리드"
                    value={`${kpis.new_leads}건`}
                    tone="mint"
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="Forecast"
                    value={money(kpis.forecast_amount)}
                    tone="gold"
                  />
                  <MetricCard
                    icon={Activity}
                    label="활동 기록"
                    value={`${kpis.activity_count}건`}
                    tone="ink"
                  />
                </section>
                <StageMatrix opportunities={opportunities} leads={leads} />
              </>
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
                leads={leads}
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
