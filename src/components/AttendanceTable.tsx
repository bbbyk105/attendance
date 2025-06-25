// components/AttendanceTable.tsx
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord } from "@/types/attendance";
import { formatDate, formatTime, getStatusLabel } from "@/lib/attendance";

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "present":
        return "default";
      case "late":
        return "secondary";
      case "early_leave":
        return "outline";
      case "absent":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">勤怠記録がありません</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日付</TableHead>
            <TableHead>ユーザー名</TableHead>
            <TableHead>出勤時刻</TableHead>
            <TableHead>退勤時刻</TableHead>
            <TableHead>休憩開始</TableHead>
            <TableHead>休憩終了</TableHead>
            <TableHead>勤務時間</TableHead>
            <TableHead>残業時間</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>備考</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                {formatDate(record.date)}
              </TableCell>
              <TableCell>{record.userName}</TableCell>
              <TableCell>{formatTime(record.clockIn)}</TableCell>
              <TableCell>{formatTime(record.clockOut)}</TableCell>
              <TableCell>{formatTime(record.breakStart)}</TableCell>
              <TableCell>{formatTime(record.breakEnd)}</TableCell>
              <TableCell className="font-mono">
                {record.workHours.toFixed(2)}h
              </TableCell>
              <TableCell className="font-mono">
                {record.overtimeHours > 0 ? (
                  <span className="text-orange-600 font-semibold">
                    {record.overtimeHours.toFixed(2)}h
                  </span>
                ) : (
                  "0.00h"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(record.status)}>
                  {getStatusLabel(record.status)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={record.note}>
                {record.note || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
