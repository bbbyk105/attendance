// components/attendance/AttendanceStatsTab.tsx
"use client";

import React, { useMemo } from "react";
import { AttendanceRecord as AuthAttendanceRecord } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Calendar } from "lucide-react";

interface AttendanceStatsTabProps {
  records: AuthAttendanceRecord[];
}

export function AttendanceStatsTab({ records }: AttendanceStatsTabProps) {
  // 統計データの計算
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 今月のレコードをフィルタリング
    const currentMonthRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    // 前月のレコードをフィルタリング
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === previousMonth &&
        recordDate.getFullYear() === previousYear
      );
    });

    // 今月の統計
    const currentMonthStats = {
      totalWorkHours: currentMonthRecords.reduce(
        (sum, record) => sum + (record.workHours || 0),
        0
      ),
      totalOvertimeHours: currentMonthRecords.reduce(
        (sum, record) => sum + (record.overtimeHours || 0),
        0
      ),
      workDays: currentMonthRecords.filter(
        (record) => record.clockIn && record.clockOut
      ).length,
      totalDays: currentMonthRecords.length,
    };

    // 前月の統計
    const previousMonthStats = {
      totalWorkHours: previousMonthRecords.reduce(
        (sum, record) => sum + (record.workHours || 0),
        0
      ),
      totalOvertimeHours: previousMonthRecords.reduce(
        (sum, record) => sum + (record.overtimeHours || 0),
        0
      ),
      workDays: previousMonthRecords.filter(
        (record) => record.clockIn && record.clockOut
      ).length,
    };

    // 前月比の計算
    const workHoursDiff =
      currentMonthStats.totalWorkHours - previousMonthStats.totalWorkHours;
    const overtimeDiff =
      currentMonthStats.totalOvertimeHours -
      previousMonthStats.totalOvertimeHours;
    const attendanceRate =
      currentMonthStats.totalDays > 0
        ? (currentMonthStats.workDays / currentMonthStats.totalDays) * 100
        : 0;

    return {
      current: currentMonthStats,
      previous: previousMonthStats,
      workHoursDiff,
      overtimeDiff,
      attendanceRate,
    };
  }, [records]);

  const formatHours = (hours: number): string => {
    return `${hours.toFixed(1)}時間`;
  };

  const formatDiff = (diff: number, unit: string = "時間"): string => {
    const sign = diff >= 0 ? "+" : "";
    return `前月比 ${sign}${diff.toFixed(1)}${unit}`;
  };

  return (
    <section className="space-y-6" aria-label="統計情報">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          勤怠統計
        </h2>
        <p className="text-muted-foreground">
          今月の勤務状況を前月と比較して確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              今月の総勤務時間
            </CardTitle>
            <Clock
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(stats.current.totalWorkHours)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {stats.workHoursDiff >= 0 ? (
                <TrendingUp
                  className="h-3 w-3 mr-1 text-green-600"
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className="h-3 w-3 mr-1 text-red-600"
                  aria-hidden="true"
                />
              )}
              <span>{formatDiff(stats.workHoursDiff)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              今月の残業時間
            </CardTitle>
            <Clock
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatHours(stats.current.totalOvertimeHours)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {stats.overtimeDiff >= 0 ? (
                <TrendingUp
                  className="h-3 w-3 mr-1 text-orange-600"
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className="h-3 w-3 mr-1 text-green-600"
                  aria-hidden="true"
                />
              )}
              <span>{formatDiff(stats.overtimeDiff)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              今月の出勤日数
            </CardTitle>
            <Calendar
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.current.workDays}日</div>
            <p className="text-xs text-muted-foreground mt-1">
              出勤率 {stats.attendanceRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              平均勤務時間/日
            </CardTitle>
            <TrendingUp
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.current.workDays > 0
                ? formatHours(
                    stats.current.totalWorkHours / stats.current.workDays
                  )
                : "0.0時間"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              標準勤務時間: 8.0時間
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>月次勤務サマリー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">総出勤日数:</span>
                <span className="font-semibold ml-2">
                  {stats.current.workDays}日
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">総勤務時間:</span>
                <span className="font-semibold ml-2">
                  {formatHours(stats.current.totalWorkHours)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">総残業時間:</span>
                <span className="font-semibold ml-2 text-orange-600">
                  {formatHours(stats.current.totalOvertimeHours)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">出勤率:</span>
                <span className="font-semibold ml-2">
                  {stats.attendanceRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>前月比較</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">勤務時間の変化:</span>
                <div className="flex items-center">
                  {stats.workHoursDiff >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  <span
                    className={
                      stats.workHoursDiff >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatDiff(stats.workHoursDiff)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">残業時間の変化:</span>
                <div className="flex items-center">
                  {stats.overtimeDiff >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-orange-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
                  )}
                  <span
                    className={
                      stats.overtimeDiff >= 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }
                  >
                    {formatDiff(stats.overtimeDiff)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">出勤日数の変化:</span>
                <div className="flex items-center">
                  {stats.current.workDays - stats.previous.workDays >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  <span>
                    {formatDiff(
                      stats.current.workDays - stats.previous.workDays,
                      "日"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 労働時間の健康度チェック */}
      <Card>
        <CardHeader>
          <CardTitle>労働時間の健康度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 残業時間の評価 */}
              <div className="text-center p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">
                  月間残業時間
                </div>
                <div
                  className={`text-2xl font-bold ${
                    stats.current.totalOvertimeHours <= 20
                      ? "text-green-600"
                      : stats.current.totalOvertimeHours <= 45
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {formatHours(stats.current.totalOvertimeHours)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.current.totalOvertimeHours <= 20
                    ? "健康的"
                    : stats.current.totalOvertimeHours <= 45
                    ? "注意"
                    : "要改善"}
                </div>
              </div>

              {/* 平均勤務時間の評価 */}
              <div className="text-center p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">
                  平均勤務時間/日
                </div>
                <div
                  className={`text-2xl font-bold ${
                    stats.current.workDays > 0 &&
                    stats.current.totalWorkHours / stats.current.workDays <= 9
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {stats.current.workDays > 0
                    ? formatHours(
                        stats.current.totalWorkHours / stats.current.workDays
                      )
                    : "0.0時間"}
                </div>
                <div className="text-xs text-muted-foreground">
                  標準: 8.0時間
                </div>
              </div>

              {/* 出勤率の評価 */}
              <div className="text-center p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">出勤率</div>
                <div
                  className={`text-2xl font-bold ${
                    stats.attendanceRate >= 95
                      ? "text-green-600"
                      : stats.attendanceRate >= 90
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.attendanceRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.attendanceRate >= 95
                    ? "優秀"
                    : stats.attendanceRate >= 90
                    ? "良好"
                    : "要改善"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
