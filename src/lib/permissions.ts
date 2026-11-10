import type { Role } from "@/generated/prisma/enums";

export type Permission =
  | "content:read"
  | "content:write"
  | "content:publish"
  | "media:write"
  | "applications:read"
  | "applications:write"
  | "applications:export"
  | "messages:read"
  | "messages:write"
  | "users:manage"
  | "settings:manage"
  | "audit:read";

const rolePermissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "content:read",
    "content:write",
    "content:publish",
    "media:write",
    "applications:read",
    "applications:write",
    "applications:export",
    "messages:read",
    "messages:write",
    "users:manage",
    "settings:manage",
    "audit:read"
  ],
  ADMIN: [
    "content:read",
    "content:write",
    "content:publish",
    "media:write",
    "applications:read",
    "applications:write",
    "applications:export",
    "messages:read",
    "messages:write",
    "settings:manage",
    "audit:read"
  ],
  EDITOR: ["content:read", "content:write", "media:write"],
  VIEWER: ["content:read", "applications:read", "messages:read"]
};

export function hasPermission(role: Role, permission: Permission, overrides: string[] = []) {
  return rolePermissions[role].includes(permission) || overrides.includes(permission);
}
