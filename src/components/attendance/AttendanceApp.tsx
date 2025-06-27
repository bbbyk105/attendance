// components/attendance/AttendanceApp.tsx
"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceTimecardTab } from "./AttendanceTimecardTab";
import { AttendanceRecordsTab } from "./AttendanceRecordsTab";
import { AttendanceExportTab } from "./AttendanceExportTab";
import { AttendanceStatsTab } from "./AttendanceStatsTab";
import { UserManagementTab } from "./UserManagementTab";
import { useAttendance } from "@/hooks/useAttendance";
import { Clock, Users, FileText, BarChart3, Settings } from "lucide-react";

export function AttendanceApp() {
  const { user } = useAuth();
  const {
    currentTime,
    currentStatus,
    todayWorkHours,
    attendanceRecords,
    componentRecords,
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd,
  } = useAttendance();

  return (
    <section className="space-y-6" aria-label="勤怠管理システム">
      <Tabs defaultValue="timecard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5" role="tablist">
          <TabsTrigger
            value="timecard"
            className="flex items-center gap-2"
            aria-label="タイムカード打刻"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">打刻</span>
          </TabsTrigger>
          <TabsTrigger
            value="records"
            className="flex items-center gap-2"
            aria-label="勤怠記録一覧"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">勤怠記録</span>
          </TabsTrigger>
          <TabsTrigger
            value="export"
            className="flex items-center gap-2"
            aria-label="CSV出力"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">CSV出力</span>
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="flex items-center gap-2"
            aria-label="統計情報"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">統計</span>
          </TabsTrigger>
          {user && (user.role === "ADMIN" || user.role === "MANAGER") && (
            <TabsTrigger
              value="users"
              className="flex items-center gap-2"
              aria-label="スタッフ管理"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">スタッフ管理</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent
          value="timecard"
          role="tabpanel"
          aria-labelledby="timecard-tab"
        >
          <AttendanceTimecardTab
            currentStatus={currentStatus}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onBreakStart={handleBreakStart}
            onBreakEnd={handleBreakEnd}
            currentTime={currentTime}
            todayWorkHours={todayWorkHours}
          />
        </TabsContent>

        <TabsContent
          value="records"
          role="tabpanel"
          aria-labelledby="records-tab"
        >
          <AttendanceRecordsTab
            records={componentRecords}
            userRole={user?.role}
          />
        </TabsContent>

        <TabsContent
          value="export"
          role="tabpanel"
          aria-labelledby="export-tab"
        >
          <AttendanceExportTab records={componentRecords} />
        </TabsContent>

        <TabsContent value="stats" role="tabpanel" aria-labelledby="stats-tab">
          <AttendanceStatsTab records={attendanceRecords} />
        </TabsContent>

        {user && (user.role === "ADMIN" || user.role === "MANAGER") && (
          <TabsContent
            value="users"
            role="tabpanel"
            aria-labelledby="users-tab"
          >
            <UserManagementTab userRole={user.role} />
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
}
