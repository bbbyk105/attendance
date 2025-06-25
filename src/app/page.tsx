// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { AttendanceRecord } from "@/types/attendance";
import { calculateWorkHours } from "@/lib/attendance";
import { Clock, Users, FileText, BarChart3 } from "lucide-react";

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("ja-JP")
  );
  const [currentStatus, setCurrentStatus] = useState<"out" | "in" | "break">(
    "out"
  );
  const [todayWorkHours, setTodayWorkHours] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [currentUser] = useState({
    id: "user-1",
    name: "山田太郎",
    email: "yamada@example.com",
    department: "開発部",
    position: "エンジニア",
  });

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("ja-JP"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // サンプルデータの初期化
  useEffect(() => {
    const sampleRecords: AttendanceRecord[] = [
      {
        id: "1",
        userId: "user-1",
        userName: "山田太郎",
        date: new Date().toISOString().split("T")[0],
        clockIn: new Date().toISOString(),
        clockOut: null,
        breakStart: null,
        breakEnd: null,
        workHours: 0,
        overtimeHours: 0,
        status: "present",
        note: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        userId: "user-1",
        userName: "山田太郎",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        clockIn: new Date(Date.now() - 86400000 + 9 * 3600000).toISOString(),
        clockOut: new Date(Date.now() - 86400000 + 18 * 3600000).toISOString(),
        breakStart: new Date(
          Date.now() - 86400000 + 12 * 3600000
        ).toISOString(),
        breakEnd: new Date(Date.now() - 86400000 + 13 * 3600000).toISOString(),
        workHours: 8,
        overtimeHours: 0,
        status: "present",
        note: "通常勤務",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    setAttendanceRecords(sampleRecords);
  }, []);

  const handleClockIn = () => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      date: today,
      clockIn: now,
      clockOut: null,
      breakStart: null,
      breakEnd: null,
      workHours: 0,
      overtimeHours: 0,
      status: "present",
      note: "",
      createdAt: now,
      updatedAt: now,
    };

    setAttendanceRecords((prev) => {
      const filtered = prev.filter((record) => record.date !== today);
      return [...filtered, newRecord];
    });
    setCurrentStatus("in");
  };

  const handleClockOut = () => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    setAttendanceRecords((prev) =>
      prev.map((record) => {
        if (record.date === today && record.userId === currentUser.id) {
          const workHours = calculateWorkHours(
            record.clockIn,
            now,
            record.breakStart,
            record.breakEnd
          );
          const overtimeHours = Math.max(0, workHours - 8);

          return {
            ...record,
            clockOut: now,
            workHours,
            overtimeHours,
            updatedAt: now,
          };
        }
        return record;
      })
    );
    setCurrentStatus("out");
    setTodayWorkHours(0);
  };

  const handleBreakStart = () => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    setAttendanceRecords((prev) =>
      prev.map((record) => {
        if (record.date === today && record.userId === currentUser.id) {
          return {
            ...record,
            breakStart: now,
            updatedAt: now,
          };
        }
        return record;
      })
    );
    setCurrentStatus("break");
  };

  const handleBreakEnd = () => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    setAttendanceRecords((prev) =>
      prev.map((record) => {
        if (record.date === today && record.userId === currentUser.id) {
          return {
            ...record,
            breakEnd: now,
            updatedAt: now,
          };
        }
        return record;
      })
    );
    setCurrentStatus("in");
  };

  // 本日の勤務時間計算
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceRecords.find(
      (record) => record.date === today && record.userId === currentUser.id
    );

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
  }, [attendanceRecords, currentStatus, currentUser.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-8 w-8" />
            勤怠管理システム
          </h1>
          <p className="text-gray-600 mt-1">
            ユーザー: {currentUser.name} ({currentUser.department})
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="timecard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timecard" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              打刻
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              勤怠記録
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              CSV出力
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              統計
            </TabsTrigger>
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
                <CardDescription>過去の勤怠記録を確認できます</CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceTable records={attendanceRecords} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <CSVExportDialog
              records={attendanceRecords}
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
                  <p className="text-xs text-muted-foreground">
                    前月比 +5.2時間
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    前月比 -2.1時間
                  </p>
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
        </Tabs>
      </main>
    </div>
  );
}
