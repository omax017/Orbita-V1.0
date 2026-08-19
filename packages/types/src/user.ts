/**
 * Papel do usuário dentro de um Tenant (permissões da equipe).
 */
export enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

/**
 * Vínculo entre um User e um Workspace, com o papel desse usuário
 * naquele workspace específico (um mesmo usuário pode pertencer
 * a mais de um workspace, ex: agência gerenciando múltiplos sellers).
 */
export interface Membership {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  invitedEmail?: string;
  status: "ACTIVE" | "PENDING" | "REVOKED";
  createdAt: string;
}
