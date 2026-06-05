import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import * as apiClient from "./api/client";
import { Dashboard } from "./features/Dashboard";

describe("Dashboard", () => {
  const props = {
    usingMockData: false,
    onCreateLead: async () => undefined,
    onDataChanged: async () => undefined,
    kpis: {
      new_leads: 1,
      hot_leads: 1,
      forecast_amount: "1000",
      closed_won_amount: "0",
      activity_count: 2
    },
    pipeline: [
      { stage: "LEAD" as const, probability: 10, count: 1, amount: "1000" },
      { stage: "QUALIFIED" as const, probability: 25, count: 0, amount: "0" },
      { stage: "PROPOSAL" as const, probability: 50, count: 0, amount: "0" },
      { stage: "NEGOTIATION" as const, probability: 75, count: 0, amount: "0" },
      { stage: "CLOSED_WON" as const, probability: 100, count: 0, amount: "0" },
      { stage: "CLOSED_LOST" as const, probability: 0, count: 0, amount: "0" }
    ],
    leads: [
      {
        id: "lead-1",
        company_name: "체리랩",
        contact_name: "김매니저",
        source_channel: "website",
        lead_score: 100,
        lead_grade: "HOT" as const,
        status: "CONVERTED",
        converted_opportunity_id: "opp-1",
        converted_opportunity_name: "체리랩 전사 도입"
      }
    ],
    opportunities: [
      {
        id: "opp-1",
        lead_id: "lead-1",
        lead_company_name: "체리랩",
        lead_contact_name: "김매니저",
        name: "체리랩 전사 도입",
        account_name: "체리랩",
        owner_name: "김도현",
        stage: "PROPOSAL" as const,
        amount: "50000000",
        probability: 50,
        forecast_amount: "25000000"
      }
    ],
    accounts: [
      {
        id: "account-1",
        name: "체리랩",
        industry: "SaaS"
      }
    ],
    contacts: [
      {
        id: "contact-1",
        account_id: "account-1",
        name: "김매니저",
        email: "kim@example.com"
      }
    ],
    activities: [
      {
        id: "activity-1",
        opportunity_id: "opp-1",
        activity_type: "MEETING",
        activity_date: "2026-05-31T09:30:00+09:00",
        description: "도입 미팅"
      }
    ],
    reports: {
      channels: [{ source_channel: "website", lead_count: 1, hot_lead_count: 1 }],
      activities_by_owner: [{ owner_id: "김도현", activity_count: 1 }],
      pipeline: [{ stage: "PROPOSAL" as const, probability: 50, count: 1, amount: "50000000" }],
      integration: { website_leads: 1, chatbot_leads: 0 }
    },
    adminSettings: {
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
        timeline_within_3_months: 25
      },
      integration_policy: {
        website_enabled: true,
        chatbot_enabled: true,
        default_owner_id: ""
      }
    },
    rolePolicies: [
      {
        role: "SUPER_ADMIN",
        data_scope: "전체 데이터",
        permissions: ["settings:write", "audit:read"]
      },
      {
        role: "SALES_REP",
        data_scope: "본인 담당 데이터",
        permissions: ["sales:write"]
      }
    ],
    loginUsers: [
      {
        name: "영업담당 박세일즈",
        email: "sales@cherrylab.com",
        role: "SALES_REP" as const,
        organization: "영업1팀",
        mobile_phone: "010-0000-0003",
        password: "sales1234"
      }
    ],
    currentUser: {
      name: "관리자",
      email: "admin@cherrylab.com",
      role: "ADMIN" as const,
      organization: "본사",
      password: "admin1234"
    },
    onLogout: () => undefined,
    onOpenPasswordChange: () => undefined
  };

  it("renders the Korean product name and KPI labels", () => {
    render(<Dashboard {...props} />);

    expect(screen.getAllByText("CherrySales")[0]).toBeInTheDocument();
    expect(screen.getByText("Hot Lead")).toBeInTheDocument();
    expect(screen.getByText("사업별 스테이지 매핑")).toBeInTheDocument();
  });

  it("changes sections when sidebar menu buttons are clicked", async () => {
    render(
      <div className="lg:block">
        <Dashboard {...props} />
      </div>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "리드" })[0]);
    expect(screen.getByText("리드 목록")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "리드 등록" })).toBeInTheDocument();
    expect(screen.getAllByText("직원 수")[0]).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "고객사" })[0]);
    expect(screen.getByRole("heading", { name: "고객사 등록" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "관리자" })[0]);
    expect(screen.getByText("SUPER_ADMIN")).toBeInTheDocument();
  });

  it("shows workflow controls for stage changes, activities and admin settings", () => {
    render(
      <div className="lg:block">
        <Dashboard {...props} />
      </div>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "리드" })[0]);
    expect(screen.getByRole("heading", { name: "리드 등록" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "체리랩 전사 도입" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: "영업기회" })[0]);
    expect(screen.getByRole("heading", { name: "영업기회 등록" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "활동" })[0]);
    expect(screen.getByRole("heading", { name: "활동 등록" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "관리자" })[0]);
    expect(screen.getByRole("heading", { name: "관리자 설정" })).toBeInTheDocument();
  });

  it("shows report and integration operations", () => {
    render(
      <div className="lg:block">
        <Dashboard {...props} />
      </div>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "리포트" })[0]);
    expect(screen.getByRole("heading", { name: "채널 성과 리포트" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "연동" })[0]);
    expect(screen.getByRole("heading", { name: "연동 리드 테스트" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "연동 리드 생성" })).toBeInTheDocument();
  });

  it("renders 0 percent in Sales Health when KPI values are zero", () => {
    render(
      <div className="lg:block">
        <Dashboard
          {...props}
          kpis={{
            new_leads: 0,
            hot_leads: 0,
            forecast_amount: "0",
            closed_won_amount: "0",
            activity_count: 0
          }}
        />
      </div>
    );

    expect(screen.getAllByText("0%").length).toBeGreaterThanOrEqual(3);
  });

  it("loads the selected opportunity checklist", async () => {
    const checklistSpy = vi.spyOn(apiClient, "loadOpportunityChecklist").mockResolvedValue({
      stage: "PROPOSAL",
      stage_label: "Proposal",
      enabled: true,
      has_related_activity: true,
      auto_advance_to: "NEGOTIATION",
      items: [
        {
          key: "activity_logged",
          title: "제안 활동 등록",
          description: "제안 단계 관련 활동이 기록되었습니다.",
          checked: true
        },
        {
          key: "proposal_shared",
          title: "제안서 전달",
          description: "제안서 또는 견적서가 전달되었습니다.",
          checked: false
        }
      ]
    });

    render(
      <div className="lg:block">
        <Dashboard {...props} />
      </div>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "영업기회" })[0]);
    fireEvent.click(screen.getAllByText("체리랩 전사 도입")[0]);

    await waitFor(() => expect(checklistSpy).toHaveBeenCalled());
    expect(screen.getByText("현재 단계 체크리스트")).toBeInTheDocument();
    expect(screen.getByText("제안 활동 등록")).toBeInTheDocument();

    checklistSpy.mockRestore();
  });

  it("opens the linked opportunity from a converted lead", async () => {
    const checklistSpy = vi.spyOn(apiClient, "loadOpportunityChecklist").mockResolvedValue({
      stage: "PROPOSAL",
      stage_label: "Proposal",
      enabled: true,
      has_related_activity: true,
      auto_advance_to: "NEGOTIATION",
      items: [],
    });

    render(
      <div className="lg:block">
        <Dashboard {...props} />
      </div>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "리드" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "체리랩 전사 도입" })[0]);

    await waitFor(() => expect(screen.getByRole("heading", { name: "영업기회 수정" })).toBeInTheDocument());
    expect(checklistSpy).toHaveBeenCalledWith("opp-1");

    checklistSpy.mockRestore();
  });

  it("opens the source lead from an opportunity row link", () => {
    render(
      <div className="lg:block">
        <Dashboard {...props} />
      </div>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "영업기회" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "체리랩 / 김매니저" }));

    expect(screen.getByRole("heading", { name: "리드 수정" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("체리랩")).toBeInTheDocument();
  });
});
