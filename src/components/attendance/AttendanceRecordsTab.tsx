// components/attendance/AttendanceRecordsTab.tsx
"use client";

import React from "react";
import { AttendanceTable } from "@/components/AttendanceTable";
import { AttendanceRecord } from "@/types/attendance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AttendanceRecordsTabProps {
  records: AttendanceRecord[];
  userRole?: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export function AttendanceRecordsTab({
  records,
  userRole,
}: AttendanceRecordsTabProps) {
  const isManagerOrAdmin = userRole === "ADMIN" || userRole === "MANAGER";

  return (
    <section className="space-y-6" aria-label="勤怠記録一覧">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">勤怠記録一覧</h2>
          </CardTitle>
          <CardDescription>
            {isManagerOrAdmin
              ? "スタッフの勤怠記録を確認できます。出勤時間、退勤時間、勤務時間などの詳細情報を表示しています。"
              : "あなたの勤怠記録を確認できます。出勤時間、退勤時間、勤務時間などの詳細情報を表示しています。"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {records.length}件の記録が見つかりました
              </div>
              <AttendanceTable records={records} />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">勤怠記録がありません</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
