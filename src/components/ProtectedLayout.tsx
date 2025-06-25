// components/ProtectedLayout.tsx
"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Clock } from "lucide-react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
}) => {
  const { user, login, logout, isLoading, isAuthenticated } = useAuth();
  const [loginError, setLoginError] = React.useState<string>("");

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setLoginError("");
    const success = await login(email, password);
    if (!success) {
      setLoginError("メールアドレスまたはパスワードが正しくありません");
    }
    return success;
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合はログインフォームを表示
  if (!isAuthenticated || !user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        isLoading={isLoading}
        error={loginError}
      />
    );
  }

  // 認証済みの場合はメインコンテンツを表示
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  勤怠管理システム
                </h1>
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex">
                店舗専用
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* ユーザー情報 */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                <Badge
                  variant={
                    user.role === "ADMIN"
                      ? "destructive"
                      : user.role === "MANAGER"
                      ? "default"
                      : "secondary"
                  }
                >
                  {user.role === "ADMIN"
                    ? "管理者"
                    : user.role === "MANAGER"
                    ? "店長"
                    : "スタッフ"}
                </Badge>
                <div className="text-xs text-gray-500">
                  {user.department} | {user.employeeId}
                </div>
              </div>

              {/* ログアウトボタン */}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">ログアウト</span>
              </Button>
            </div>
          </div>

          {/* モバイル用ユーザー情報 */}
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {user.name} ({user.employeeId})
                </span>
              </div>
              <Badge
                variant={
                  user.role === "ADMIN"
                    ? "destructive"
                    : user.role === "MANAGER"
                    ? "default"
                    : "secondary"
                }
              >
                {user.role === "ADMIN"
                  ? "管理者"
                  : user.role === "MANAGER"
                  ? "店長"
                  : "スタッフ"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      {/* フッター */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 勤怠管理システム. All rights reserved.</p>
            <p className="mt-1">店舗専用システム | {user.department}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
