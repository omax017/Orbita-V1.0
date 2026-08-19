import { apiFetch } from "@/lib/api-client";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
}

export interface MembershipSummary {
  role: WorkspaceRole;
  workspace: WorkspaceSummary;
}

export interface MeResponse {
  user: SafeUser;
  memberships: MembershipSummary[];
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}) {
  return apiFetch<{ user: SafeUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<{ user: SafeUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<MeResponse>("/auth/me");
}
