// Domain types for the application
// These map to the database schema but are ergonomic for UI use

export type Role = "leader" | "supervisor" | "pastor";
export type Category = "visitor" | "attender" | "member";
export type ProfileStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: ProfileStatus;
  role: Role | null;
  createdAt: string;
}

export interface Person {
  id: string;
  gdId: string;
  name: string;
  category: Category;
  memberSince: string | null; // ISO date
  createdAt: string;
}

export interface GD {
  id: string;
  name: string;
  active: boolean;
  /** Meeting weekday: 0 = Sunday … 6 = Saturday, matching JS `Date.getDay()`.
   *  Null when it was never set (all GDs that predate the column). */
  weekday: number | null;
  /** Meeting start time as the database returns it — `"HH:MM:SS"`. Use
   *  `formatTime()` before showing it. Null when it was never set. */
  startTime: string | null;
  createdAt: string;
  // joined from gd_staff
  staff?: GdStaffMember[];
}

export interface GdStaffMember {
  gdId: string;
  profileId: string;
  // from profiles
  profileName?: string;
  profileRole?: Role;
}

export interface Week {
  id: string;
  gdId: string;
  date: string; // ISO date
  label: string; // e.g. "28 jul"
  createdBy: string | null;
  createdAt: string;
}

export interface AttendanceRecord {
  weekId: string;
  personId: string;
  categoryAtTime: Category;
}

// Enriched types for UI components
export interface WeekWithAttendance extends Week {
  presentPersonIds: string[];
  presentPeople: Person[];
}
