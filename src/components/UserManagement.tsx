// components/UserManagement.tsx
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, Eye, EyeOff } from "lucide-react";
import { User, CreateUserRequest } from "@/types/auth";

interface UserManagementProps {
  userRole: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export const UserManagement: React.FC<UserManagementProps> = ({ userRole }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateUserRequest>({
    email: "",
    name: "",
    employeeId: "",
    password: "",
    department: "",
    position: "",
    role: "EMPLOYEE",
  });

  // ユーザー一覧取得
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError("ユーザー一覧の取得に失敗しました");
      }
    } catch {
      setError("サーバーエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(createFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) => [data.user, ...prev]);
        setShowCreateDialog(false);
        setCreateFormData({
          email: "",
          name: "",
          employeeId: "",
          password: "",
          department: "",
          position: "",
          role: "EMPLOYEE",
        });
        setError("");
      } else {
        setError(data.error || "ユーザー作成に失敗しました");
      }
    } catch {
      setError("サーバーエラーが発生しました");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "MANAGER":
        return "default";
      case "EMPLOYEE":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "管理者";
      case "MANAGER":
        return "店長";
      case "EMPLOYEE":
        return "スタッフ";
      default:
        return role;
    }
  };

  if (userRole !== "ADMIN" && userRole !== "MANAGER") {
    return (
      <Alert>
        <AlertDescription>
          ユーザー管理機能は管理者のみ利用できます。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                ユーザー管理
              </CardTitle>
              <CardDescription>店舗スタッフの管理と新規追加</CardDescription>
            </div>
            {userRole === "ADMIN" && (
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    スタッフ追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>新規スタッフ追加</DialogTitle>
                    <DialogDescription>
                      新しいスタッフの情報を入力してください
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">氏名 *</Label>
                        <Input
                          id="name"
                          value={createFormData.name}
                          onChange={(e) =>
                            setCreateFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="山田太郎"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">従業員ID *</Label>
                        <Input
                          id="employeeId"
                          value={createFormData.employeeId}
                          onChange={(e) =>
                            setCreateFormData((prev) => ({
                              ...prev,
                              employeeId: e.target.value,
                            }))
                          }
                          placeholder="EMP001"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createFormData.email}
                        onChange={(e) =>
                          setCreateFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="yamada@store.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">パスワード *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={createFormData.password}
                          onChange={(e) =>
                            setCreateFormData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          placeholder="8文字以上の強力なパスワード"
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">部署 *</Label>
                        <Input
                          id="department"
                          value={createFormData.department}
                          onChange={(e) =>
                            setCreateFormData((prev) => ({
                              ...prev,
                              department: e.target.value,
                            }))
                          }
                          placeholder="販売部"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">役職 *</Label>
                        <Input
                          id="position"
                          value={createFormData.position}
                          onChange={(e) =>
                            setCreateFormData((prev) => ({
                              ...prev,
                              position: e.target.value,
                            }))
                          }
                          placeholder="スタッフ"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">権限 *</Label>
                      <Select
                        value={createFormData.role}
                        onValueChange={(
                          value: "ADMIN" | "MANAGER" | "EMPLOYEE"
                        ) =>
                          setCreateFormData((prev) => ({
                            ...prev,
                            role: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">スタッフ</SelectItem>
                          <SelectItem value="MANAGER">店長</SelectItem>
                          <SelectItem value="ADMIN">管理者</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        キャンセル
                      </Button>
                      <Button type="submit">作成</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              読み込み中...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>従業員ID</TableHead>
                    <TableHead>氏名</TableHead>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>部署</TableHead>
                    <TableHead>役職</TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>登録日</TableHead>
                    {userRole === "ADMIN" && <TableHead>操作</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">
                        {user.employeeId}
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.position}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "アクティブ" : "無効"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                      </TableCell>
                      {userRole === "ADMIN" && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
