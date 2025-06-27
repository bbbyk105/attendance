// components/attendance/AttendanceExportTab.tsx
"use client";

import React from "react";
import { CSVExportDialog } from "@/components/CSVExportDialog";
import { AttendanceRecord } from "@/types/attendance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AttendanceExportTabProps {
  records: AttendanceRecord[];
}

export function AttendanceExportTab({ records }: AttendanceExportTabProps) {
  const handleExport = () => {
    console.log("CSV出力完了");
    // 必要に応じて成功メッセージやアナリティクスの送信などを追加
  };

  return (
    <section className="space-y-6" aria-label="CSV出力">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">勤怠データ出力</h2>
          </CardTitle>
          <CardDescription>
            勤怠記録をCSV形式でダウンロードできます。
            給与計算や労務管理にご活用ください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                出力可能データ: {records.length}件
              </div>
              <CSVExportDialog records={records} onExport={handleExport} />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                出力可能な勤怠記録がありません
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
