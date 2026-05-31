import { useEffect, useState } from "react";

import { createLead, loadDashboard } from "./api/client";
import type {
  AccountSummary,
  ActivitySummary,
  AdminSettings,
  ContactSummary,
  DashboardKpis,
  DashboardReports,
  LeadCreateInput,
  LeadSummary,
  OpportunitySummary,
  PipelineSummary,
  RolePolicy
} from "./api/types";
import { Dashboard } from "./features/Dashboard";

interface DashboardState {
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
}

export function App() {
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    void loadDashboard().then(setState);
  }, []);

  async function handleCreateLead(payload: LeadCreateInput) {
    await createLead(payload);
    setState(await loadDashboard());
  }

  async function handleDataChanged() {
    setState(await loadDashboard());
  }

  if (state === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f8] text-ink">
        <div className="rounded-lg border border-line bg-white px-5 py-4 text-sm font-medium">
          영업 현황을 불러오는 중
        </div>
      </main>
    );
  }

  return (
    <Dashboard
      {...state}
      onCreateLead={handleCreateLead}
      onDataChanged={handleDataChanged}
    />
  );
}
