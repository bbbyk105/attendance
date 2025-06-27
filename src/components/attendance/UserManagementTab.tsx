// components/attendance/UserManagementTab.tsx
"use client";

import React from "react";
import { UserManagement } from "@/components/UserManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserManagementTabProps {
  userRole: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export function UserManagementTab({ userRole }: UserManagementTabProps) {
  return (
    <section className="space-y-6" aria-label="スタッフ管理">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">スタッフ管理</h2>
          </CardTitle>
          <CardDescription>
            {userRole === "ADMIN"
              ? "システム全体のユーザー管理、アクセス権限の設定、新規スタッフの追加などを行えます。"
              : "所属スタッフの基本情報確認と一部の管理業務を行えます。"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagement userRole={userRole} />
        </CardContent>
      </Card>
    </section>
  );
}
