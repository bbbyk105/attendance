// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceTimeCard } from "@/components/AttendanceTimeCard";
import { CSVExportDialog } from "@/components/CSVExportDialog";
import { AttendanceTable } from "@/components/AttendanceTable";
import { UserManagement } from "@/components/UserManagement";
import { AttendanceRecord as AuthAttendanceRecord } from "@/types/auth";
import {
  convertAuthRecordsToComponentRecords,
  getTodayRecord,
  getCurrentWorkStatus,
} from "@/lib/attendance-utils";
import { Clock, Users, FileText, BarChart3, Settings } from "lucide-react";

function AttendanceApp() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("ja-JP")
  );
  const [currentStatus, setCurrentStatus] = useState<"out" | "in" | "break">(
    "out"
  );
  const [todayWorkHours, setTodayWorkHours] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AuthAttendanceRecord[]
  >([]);

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("ja-JP"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 勤怠記録の取得
  useEffect(() => {
    if (user) {
      fetchAttendanceRecords();
    }
  }, [user]);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch("/api/attendance", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to fetch attendance records:", error);
    }
  };

  const calculateWorkHours = (
    clockIn: string | null,
    clockOut: string | null,
    breakStart: string | null,
    breakEnd: string | null
  ): number => {
    if (!clockIn || !clockOut) return 0;

    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    let workTime = end - start;

    if (breakStart && breakEnd) {
      const breakStartTime = new Date(breakStart).getTime();
      const breakEndTime = new Date(breakEnd).getTime();
      workTime -= breakEndTime - breakStartTime;
    }

    return Math.max(0, workTime / (1000 * 60 * 60)); // 時間に変換
  };

  const handleClockIn = async () => {
    try {
      const response = await fetch("/api/attendance/clock-in", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setCurrentStatus("in");
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error("Clock in failed:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await fetch("/api/attendance/clock-out", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setCurrentStatus("out");
        setTodayWorkHours(0);
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error("Clock out failed:", error);
    }
  };

  const handleBreakStart = async () => {
    try {
      const response = await fetch("/api/attendance/break-start", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setCurrentStatus("break");
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error("Break start failed:", error);
    }
  };

  const handleBreakEnd = async () => {
    try {
      const response = await fetch("/api/attendance/break-end", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setCurrentStatus("in");
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error("Break end failed:", error);
    }
  };

  // 本日の勤務時間計算
  useEffect(() => {
    if (!user) return;

    const todayRecord = getTodayRecord(attendanceRecords, user.id);
    const currentStatus = getCurrentWorkStatus(todayRecord);
    setCurrentStatus(currentStatus);

    if (todayRecord && todayRecord.clockIn) {
      const now = new Date().toISOString();
      const workHours = calculateWorkHours(
        todayRecord.clockIn,
        todayRecord.clockOut || now,
        todayRecord.breakStart,
        todayRecord.breakEnd
      );
      setTodayWorkHours(workHours);
    }
  }, [attendanceRecords, user]);

  // コンポーネント用に変換されたレコード
  const componentRecords =
    convertAuthRecordsToComponentRecords(attendanceRecords);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="timecard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timecard" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">打刻</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">勤怠記録</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">CSV出力</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">統計</span>
          </TabsTrigger>
          {user && (user.role === "ADMIN" || user.role === "MANAGER") && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">スタッフ管理</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="timecard" className="space-y-6">
          <AttendanceTimeCard
            currentStatus={currentStatus}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onBreakStart={handleBreakStart}
            onBreakEnd={handleBreakEnd}
            currentTime={currentTime}
            todayWorkHours={todayWorkHours}
          />
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>勤怠記録一覧</CardTitle>
              <CardDescription>
                {user && (user.role === "ADMIN" || user.role === "MANAGER")
                  ? "スタッフの勤怠記録を確認できます"
                  : "自分の勤怠記録を確認できます"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceTable records={componentRecords} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <CSVExportDialog
            records={componentRecords}
            onExport={() => console.log("CSV出力完了")}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  今月の総勤務時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">160.5時間</div>
                <p className="text-xs text-muted-foreground">前月比 +5.2時間</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  今月の残業時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  12.3時間
                </div>
                <p className="text-xs text-muted-foreground">前月比 -2.1時間</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  今月の出勤日数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">20日</div>
                <p className="text-xs text-muted-foreground">出勤率 95.2%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {user && (user.role === "ADMIN" || user.role === "MANAGER") && (
          <TabsContent value="users" className="space-y-6">
            <UserManagement userRole={user.role} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AttendanceApp />
      </ProtectedLayout>
    </AuthProvider>
  );
}
