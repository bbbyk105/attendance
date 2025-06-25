// types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    employeeId: string;
    department: string;
    position: string;
    role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  };
  token?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  employeeId: string;
  password: string;
  department: string;
  position: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export interface UpdateUserRequest {
  name?: string;
  department?: string;
  position?: string;
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 更新された勤怠記録型
export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  workHours: number;
  overtimeHours: number;
  status:
    | "PRESENT"
    | "ABSENT"
    | "LATE"
    | "EARLY_LEAVE"
    | "HOLIDAY"
    | "SICK_LEAVE";
  note: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    employeeId: string;
    department: string;
  };
}
