// components/AttendanceTimeCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, LogIn, LogOut } from "lucide-react";

interface AttendanceTimeCardProps {
  currentStatus: "out" | "in" | "break";
  onClockIn: () => void;
  onClockOut: () => void;
  onBreakStart: () => void;
  onBreakEnd: () => void;
  currentTime: string;
  todayWorkHours: number;
}

export const AttendanceTimeCard: React.FC<AttendanceTimeCardProps> = ({
  currentStatus,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
  currentTime,
  todayWorkHours,
}) => {
  const getStatusBadge = () => {
    switch (currentStatus) {
      case "in":
        return (
          <Badge variant="default" className="bg-green-500">
            勤務中
          </Badge>
        );
      case "break":
        return <Badge variant="secondary">休憩中</Badge>;
      case "out":
        return <Badge variant="outline">退勤済み</Badge>;
      default:
        return <Badge variant="outline">未出勤</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          勤怠打刻
        </CardTitle>
        <CardDescription>
          <div className="text-2xl font-mono">{currentTime}</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>ステータス:</span>
          {getStatusBadge()}
        </div>

        <div className="flex justify-between items-center">
          <span>本日の勤務時間:</span>
          <span className="font-mono">{todayWorkHours.toFixed(2)}時間</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onClockIn}
            disabled={currentStatus === "in" || currentStatus === "break"}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            出勤
          </Button>

          <Button
            onClick={onClockOut}
            disabled={currentStatus === "out"}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            退勤
          </Button>

          <Button
            onClick={onBreakStart}
            disabled={currentStatus !== "in"}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Coffee className="h-4 w-4" />
            休憩開始
          </Button>

          <Button
            onClick={onBreakEnd}
            disabled={currentStatus !== "break"}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Coffee className="h-4 w-4" />
            休憩終了
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
