// types/attendance.ts
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  workHours: number;
  overtimeHours: number;
  status: "present" | "absent" | "late" | "early_leave";
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  isActive: boolean;
}

export interface AttendanceStats {
  totalWorkHours: number;
  totalOvertimeHours: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
}

export interface CSVExportOptions {
  startDate: string;
  endDate: string;
  userIds?: string[];
  includeBreaks: boolean;
  includeNotes: boolean;
}
