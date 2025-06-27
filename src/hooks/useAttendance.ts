// hooks/useAttendance.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AttendanceRecord as AuthAttendanceRecord } from "@/types/auth";
import {
  convertAuthRecordsToComponentRecords,
  getTodayRecord,
  getCurrentWorkStatus,
} from "@/lib/attendance-utils";

export function useAttendance() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("ja-JP"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 成功メッセージを表示する関数
  const showSuccessMessage = useCallback((message: string) => {
    // ここでトーストやスナックバーなどの成功メッセージを表示
    console.log(`✅ ${message}`);
  }, []);

  // エラーメッセージを表示する関数
  const showErrorMessage = useCallback((message: string) => {
    setError(message);
    // 5秒後に自動的にエラーをクリア
    setTimeout(() => setError(null), 5000);
  }, []);

  // 勤怠記録の取得
  const fetchAttendanceRecords = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/attendance", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`勤怠記録の取得に失敗しました: ${response.status}`);
      }

      const data = await response.json();
      setAttendanceRecords(data.records);
    } catch (error) {
      console.error("Failed to fetch attendance records:", error);
      showErrorMessage(
        error instanceof Error
          ? error.message
          : "勤怠記録の取得中にエラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, showErrorMessage]);

  // 初回データ取得
  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  // 勤務時間の計算
  const calculateWorkHours = useCallback(
    (
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

      return Math.max(0, workTime / (1000 * 60 * 60));
    },
    []
  );

  // API呼び出しの共通処理
  const makeAttendanceRequest = useCallback(
    async (
      endpoint: string,
      successStatus: "out" | "in" | "break",
      actionName: string,
      successMessage: string
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/attendance/${endpoint}`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `${actionName}に失敗しました`);
        }

        setCurrentStatus(successStatus);
        if (successStatus === "out") {
          setTodayWorkHours(0);
        }

        await fetchAttendanceRecords();
        showSuccessMessage(successMessage);
        return true;
      } catch (error) {
        console.error(`${actionName} failed:`, error);
        showErrorMessage(
          error instanceof Error ? error.message : `${actionName}に失敗しました`
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAttendanceRecords, showSuccessMessage, showErrorMessage]
  );

  // 各種操作のハンドラー
  const handleClockIn = useCallback(
    () =>
      makeAttendanceRequest("clock-in", "in", "出勤", "出勤時刻を記録しました"),
    [makeAttendanceRequest]
  );

  const handleClockOut = useCallback(
    () =>
      makeAttendanceRequest(
        "clock-out",
        "out",
        "退勤",
        "退勤時刻を記録しました。お疲れ様でした"
      ),
    [makeAttendanceRequest]
  );

  const handleBreakStart = useCallback(
    () =>
      makeAttendanceRequest(
        "break-start",
        "break",
        "休憩開始",
        "休憩を開始しました"
      ),
    [makeAttendanceRequest]
  );

  const handleBreakEnd = useCallback(
    () =>
      makeAttendanceRequest(
        "break-end",
        "in",
        "休憩終了",
        "休憩を終了し、勤務を再開しました"
      ),
    [makeAttendanceRequest]
  );

  // 本日の勤務時間とステータスの更新
  useEffect(() => {
    if (!user) return;

    const todayRecord = getTodayRecord(attendanceRecords, user.id);
    const status = getCurrentWorkStatus(todayRecord);
    setCurrentStatus(status);

    if (todayRecord && todayRecord.clockIn) {
      const now = new Date().toISOString();
      const workHours = calculateWorkHours(
        todayRecord.clockIn,
        todayRecord.clockOut || now,
        todayRecord.breakStart,
        todayRecord.breakEnd
      );
      setTodayWorkHours(workHours);
    } else {
      setTodayWorkHours(0);
    }
  }, [attendanceRecords, user, calculateWorkHours]);

  // コンポーネント用に変換されたレコード
  const componentRecords =
    convertAuthRecordsToComponentRecords(attendanceRecords);

  // エラーリセット
  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    currentTime,
    currentStatus,
    todayWorkHours,
    attendanceRecords,
    componentRecords,
    isLoading,
    error,

    // Actions
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd,
    fetchAttendanceRecords,
    clearError,

    // Utilities
    calculateWorkHours,
  };
}
