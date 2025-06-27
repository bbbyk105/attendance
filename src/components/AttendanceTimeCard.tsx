// components/AttendanceTimeCard.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Clock, Coffee, LogIn, LogOut, AlertCircle } from "lucide-react";

interface AttendanceTimeCardProps {
  currentStatus: "out" | "in" | "break";
  onClockIn: () => void;
  onClockOut: () => void;
  onBreakStart: () => void;
  onBreakEnd: () => void;
  currentTime: string;
  todayWorkHours: number;
  isLoading?: boolean;
}

type DialogType = "clock-in" | "clock-out" | "break-start" | "break-end" | null;

export const AttendanceTimeCard: React.FC<AttendanceTimeCardProps> = ({
  currentStatus,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
  currentTime,
  todayWorkHours,
  isLoading = false,
}) => {
  const [dialogType, setDialogType] = useState<DialogType>(null);

  // 各状態に応じたボタンの有効/無効を制御
  const getButtonStates = () => {
    type ButtonVariant = "default" | "destructive" | "outline" | "secondary";

    interface ButtonConfig {
      enabled: boolean;
      variant: ButtonVariant;
      tooltip: string;
    }

    const states: {
      clockIn: ButtonConfig;
      clockOut: ButtonConfig;
      breakStart: ButtonConfig;
      breakEnd: ButtonConfig;
    } = {
      clockIn: { enabled: false, variant: "default", tooltip: "" },
      clockOut: { enabled: false, variant: "destructive", tooltip: "" },
      breakStart: { enabled: false, variant: "outline", tooltip: "" },
      breakEnd: { enabled: false, variant: "outline", tooltip: "" },
    };

    switch (currentStatus) {
      case "out": // 未出勤状態
        states.clockIn = {
          enabled: true,
          variant: "default",
          tooltip: "出勤時刻を記録します",
        };
        states.clockOut = {
          enabled: false,
          variant: "secondary",
          tooltip: "出勤していません",
        };
        states.breakStart = {
          enabled: false,
          variant: "secondary",
          tooltip: "出勤してから休憩できます",
        };
        states.breakEnd = {
          enabled: false,
          variant: "secondary",
          tooltip: "休憩中ではありません",
        };
        break;

      case "in": // 勤務中状態
        states.clockIn = {
          enabled: false,
          variant: "secondary",
          tooltip: "既に出勤済みです",
        };
        states.clockOut = {
          enabled: true,
          variant: "destructive",
          tooltip: "退勤時刻を記録します",
        };
        states.breakStart = {
          enabled: true,
          variant: "outline",
          tooltip: "休憩を開始します",
        };
        states.breakEnd = {
          enabled: false,
          variant: "secondary",
          tooltip: "休憩中ではありません",
        };
        break;

      case "break": // 休憩中状態
        states.clockIn = {
          enabled: false,
          variant: "secondary",
          tooltip: "休憩を終了してください",
        };
        states.clockOut = {
          enabled: false,
          variant: "secondary",
          tooltip: "休憩を終了してから退勤できます",
        };
        states.breakStart = {
          enabled: false,
          variant: "secondary",
          tooltip: "既に休憩中です",
        };
        states.breakEnd = {
          enabled: true,
          variant: "outline",
          tooltip: "休憩を終了し勤務を再開します",
        };
        break;
    }

    return states;
  };

  const buttonStates = getButtonStates();

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "in":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Clock className="h-3 w-3 mr-1" />
            勤務中
          </Badge>
        );
      case "break":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Coffee className="h-3 w-3 mr-1" />
            休憩中
          </Badge>
        );
      case "out":
        return (
          <Badge variant="outline">
            <LogOut className="h-3 w-3 mr-1" />
            退勤済み
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            未出勤
          </Badge>
        );
    }
  };

  const getDialogConfig = (type: DialogType) => {
    const currentTimeFormatted = new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });

    switch (type) {
      case "clock-in":
        return {
          title: "出勤確認",
          description: `${currentTimeFormatted}に出勤しますか？\n\n• 出勤時刻が記録されます\n• 勤務を開始します`,
          confirmText: "出勤する",
          onConfirm: onClockIn,
          icon: "clock-in" as const,
        };
      case "clock-out":
        return {
          title: "退勤確認",
          description: `${currentTimeFormatted}に退勤しますか？\n\n• 本日の勤務時間: ${todayWorkHours.toFixed(
            2
          )}時間\n• 退勤時刻が記録されます`,
          confirmText: "退勤する",
          onConfirm: onClockOut,
          variant: "destructive" as const,
          icon: "clock-out" as const,
        };
      case "break-start":
        return {
          title: "休憩開始確認",
          description: `${currentTimeFormatted}から休憩を開始しますか？\n\n• 休憩時間は勤務時間から除外されます。`,
          confirmText: "休憩開始",
          onConfirm: onBreakStart,
          icon: "break-start" as const,
        };
      case "break-end":
        return {
          title: "休憩終了確認",
          description: `${currentTimeFormatted}に休憩を終了しますか？\n\n• 勤務を再開します\n• 退勤が可能になります`,
          confirmText: "休憩終了",
          onConfirm: onBreakEnd,
          icon: "break-end" as const,
        };
      default:
        return null;
    }
  };

  const dialogConfig = getDialogConfig(dialogType);

  // 勤務時間に基づく表示色の制御
  const getWorkHoursColor = () => {
    if (todayWorkHours === 0) return "text-muted-foreground";
    if (todayWorkHours >= 8) return "text-orange-600 font-semibold";
    if (todayWorkHours >= 6) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Clock className="h-6 w-6" />
            勤怠打刻
          </CardTitle>
          <CardDescription>
            <div className="text-3xl font-mono font-bold text-foreground mt-2">
              {currentTime}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ステータス表示 */}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">現在のステータス:</span>
            {getStatusBadge()}
          </div>

          {/* 勤務時間表示 */}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">本日の勤務時間:</span>
            <span className={`font-mono text-lg ${getWorkHoursColor()}`}>
              {todayWorkHours.toFixed(2)}時間
            </span>
          </div>

          {/* 操作ボタン */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setDialogType("clock-in")}
              disabled={!buttonStates.clockIn.enabled || isLoading}
              variant={buttonStates.clockIn.variant}
              className="flex items-center gap-2 h-12"
              title={buttonStates.clockIn.tooltip}
            >
              <LogIn className="h-4 w-4" />
              出勤
            </Button>

            <Button
              onClick={() => setDialogType("clock-out")}
              disabled={!buttonStates.clockOut.enabled || isLoading}
              variant={buttonStates.clockOut.variant}
              className="flex items-center gap-2 h-12"
              title={buttonStates.clockOut.tooltip}
            >
              <LogOut className="h-4 w-4" />
              退勤
            </Button>

            <Button
              onClick={() => setDialogType("break-start")}
              disabled={!buttonStates.breakStart.enabled || isLoading}
              variant={buttonStates.breakStart.variant}
              className="flex items-center gap-2 h-12"
              title={buttonStates.breakStart.tooltip}
            >
              <Coffee className="h-4 w-4" />
              休憩開始
            </Button>

            <Button
              onClick={() => setDialogType("break-end")}
              disabled={!buttonStates.breakEnd.enabled || isLoading}
              variant={buttonStates.breakEnd.variant}
              className="flex items-center gap-2 h-12"
              title={buttonStates.breakEnd.tooltip}
            >
              <Coffee className="h-4 w-4" />
              休憩終了
            </Button>
          </div>

          {/* 状態に応じたガイダンス */}
          <div className="text-center text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            {currentStatus === "out" &&
              "出勤ボタンを押して勤務を開始してください"}
            {currentStatus === "in" &&
              "勤務中です。休憩または退勤を選択できます"}
            {currentStatus === "break" &&
              "休憩中です。休憩終了ボタンで勤務を再開できます"}
          </div>

          {/* ローディング表示 */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              処理中...
            </div>
          )}
        </CardContent>
      </Card>

      {/* 確認ダイアログ */}
      {dialogConfig && (
        <ConfirmationDialog
          open={dialogType !== null}
          onOpenChange={(open) => !open && setDialogType(null)}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmText={dialogConfig.confirmText}
          onConfirm={dialogConfig.onConfirm}
          variant={dialogConfig.variant}
          icon={dialogConfig.icon}
        />
      )}
    </>
  );
};
