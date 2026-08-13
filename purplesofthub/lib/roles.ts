export const supportedRoles = [
  "guest",
  "client",
  "student",
  "instructor",
  "artist",
  "staff",
  "admin",
  "super-admin",
] as const;

export type Role = (typeof supportedRoles)[number];

export const roleLabels: Record<Role, string> = {
  guest: "Guest",
  client: "Client",
  student: "Student",
  instructor: "Instructor",
  artist: "Artist",
  staff: "Staff",
  admin: "Admin",
  "super-admin": "Super Admin",
};

/**
 * Preview role for the Platform Shell only.
 * Navigation items declare roles, but RBAC is not enforced in this sprint.
 */
export const previewPlatformRole: Role = "admin";

