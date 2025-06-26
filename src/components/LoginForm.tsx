"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, LogIn, Store, User, Users } from "lucide-react";

interface LoginUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  position: string;
  role: string;
}

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  isLoading,
  error,
}) => {
  const [users, setUsers] = useState<LoginUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // ユーザー一覧取得
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch("/api/auth/users");

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setUsersError("ユーザー一覧の取得に失敗しました");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersError("サーバーエラーが発生しました");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!selectedUser) {
      errors.user = "ユーザーを選択してください";
    }

    if (!password) {
      errors.password = "パスワードを入力してください";
    } else if (password.length < 6) {
      errors.password = "パスワードは6文字以上で入力してください";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedUser) return;

    const success = await onLogin(selectedUser.email, password);
    if (!success) {
      setPassword("");
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user || null);

    // ユーザー選択時にバリデーションエラーをクリア
    if (validationErrors.user) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.user;
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    // パスワード入力時にバリデーションエラーをクリア
    if (validationErrors.password) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">ユーザー情報を読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="py-12">
            <Alert variant="destructive">
              <AlertDescription>{usersError}</AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              onClick={fetchUsers}
              variant="outline"
            >
              再試行
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">勤怠管理システム</CardTitle>
          <CardDescription>
            ユーザーを選択してログインしてください
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="user">ユーザー選択</Label>
              <Select onValueChange={handleUserSelect} disabled={isLoading}>
                <SelectTrigger
                  className={validationErrors.user ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="ユーザーを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-gray-500">
                            {user.employeeId} | {user.department}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.user && (
                <p className="text-sm text-red-500">{validationErrors.user}</p>
              )}
            </div>

            {selectedUser && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{selectedUser.name}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>従業員ID: {selectedUser.employeeId}</p>
                  <p>部署: {selectedUser.department}</p>
                  <p>役職: {selectedUser.position}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={
                    validationErrors.password ? "border-red-500 pr-10" : "pr-10"
                  }
                  disabled={isLoading || !selectedUser}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || !selectedUser}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !selectedUser}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ログイン中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  ログイン
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span>登録ユーザー数: {users.length}名</span>
              </div>
              <div className="bg-gray-50 p-3 rounded text-left">
                <p className="font-medium mb-2">デモアカウント情報:</p>
                <p>管理者ユーザーを選択</p>
                <p>パスワード: admin123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
