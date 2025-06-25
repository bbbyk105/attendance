// lib/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const TOKEN_EXPIRE_TIME = "7d";

// JWTペイロード型定義
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  employeeId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// 認証結果型定義
export interface AuthResult {
  user: JwtPayload | null;
  error?: string;
}

export class AuthService {
  // パスワードをハッシュ化
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // パスワードを検証
  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // JWTトークンを生成
  static generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRE_TIME,
      issuer: "attendance-system",
      audience: "store-employees",
    });
  }

  // JWTトークンを検証
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      throw new Error("Invalid token");
    }
  }

  // Cookieにトークンを設定
  static async setTokenCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7日間
      path: "/",
    });
  }

  // Cookieからトークンを取得
  static async getTokenFromCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");
    return token?.value || null;
  }

  // Cookieからトークンを削除
  static async clearTokenCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
  }

  // パスワード強度チェック
  static validatePassword(password: string): {
    isValid: boolean;
    message?: string;
  } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: "パスワードは8文字以上である必要があります",
      };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: "パスワードには小文字を含める必要があります",
      };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: "パスワードには大文字を含める必要があります",
      };
    }

    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: "パスワードには数字を含める必要があります",
      };
    }

    return { isValid: true };
  }

  // メールアドレス形式チェック
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 従業員IDの形式チェック（例: EMP001）
  static validateEmployeeId(employeeId: string): boolean {
    const employeeIdRegex = /^[A-Z]{3}\d{3}$/;
    return employeeIdRegex.test(employeeId);
  }
}

// ミドルウェア用認証チェック
export async function requireAuth(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") ||
      (await AuthService.getTokenFromCookie());

    if (!token) {
      return { user: null, error: "No token provided" };
    }

    const decoded = AuthService.verifyToken(token);
    return { user: decoded };
  } catch {
    return { user: null, error: "Invalid token" };
  }
}

// 役割ベースアクセス制御
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    ADMIN: 3,
    MANAGER: 2,
    EMPLOYEE: 1,
  } as const;

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}
