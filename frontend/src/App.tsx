import { FormEvent, useEffect, useState } from "react";

import { authenticateLoginUser, createLead, loadDashboard, loadLoginUsers } from "./api/client";
import type {
  AccountSummary,
  ActivitySummary,
  AdminSettings,
  ContactSummary,
  DashboardKpis,
  DashboardReports,
  LeadCreateInput,
  LeadSummary,
  LoginUser,
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
  const [loginUsers, setLoginUsers] = useState<LoginUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    void (async () => {
      const users = await loadLoginUsers();
      setLoginUsers(users);
      const savedUserId = localStorage.getItem("sales-management-current-user-id");
      if (savedUserId) {
        const matched = users.find((user) => user.id === savedUserId);
        if (matched) {
          setCurrentUser(matched);
        }
      }
      setState(await loadDashboard());
    })();
  }, []);

  async function handleCreateLead(payload: LeadCreateInput) {
    await createLead(payload);
    setState(await loadDashboard());
  }

  async function handleDataChanged() {
    setState(await loadDashboard());
    setLoginUsers(await loadLoginUsers());
  }

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    const user = await authenticateLoginUser(loginEmail, loginPassword);
    if (!user) {
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    setLoginError("");
    setCurrentUser(user);
    localStorage.setItem("sales-management-current-user-id", user.id);
  }

  function handleLogout() {
    localStorage.removeItem("sales-management-current-user-id");
    setCurrentUser(null);
    setLoginPassword("");
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

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7f8] px-4">
        <form
          onSubmit={handleLoginSubmit}
          className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-sm"
        >
          <h1 className="text-2xl font-bold text-ink">Cherrysales 로그인</h1>
          <p className="mt-2 text-sm text-slate-600">로그인 사용자 관리에 등록된 계정으로 로그인하세요.</p>
          <div className="mt-5 space-y-3">
            <label className="block text-sm font-medium">
              이메일
              <input
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="admin@cherrylab.com"
              />
            </label>
            <label className="block text-sm font-medium">
              비밀번호
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="password"
              />
            </label>
            {loginError ? <p className="text-sm font-medium text-rose-600">{loginError}</p> : null}
            <button className="w-full rounded-md bg-rose-600 px-4 py-2 font-bold text-white">로그인</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <Dashboard
      {...state}
      loginUsers={loginUsers}
      currentUser={currentUser}
      onCreateLead={handleCreateLead}
      onDataChanged={handleDataChanged}
      onLogout={handleLogout}
    />
  );
}
