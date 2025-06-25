// lib/attendance-utils.ts
import { AttendanceRecord as AuthAttendanceRecord } from "@/types/auth";
import { AttendanceRecord as ComponentAttendanceRecord } from "@/types/attendance";

/**
 * APIから取得した勤怠記録をコンポーネント用の型に変換する
 */
export const convertAuthRecordToComponentRecord = (
  record: AuthAttendanceRecord
): ComponentAttendanceRecord => {
  // ステータスの変換マッピング
  const statusMapping: Record<
    AuthAttendanceRecord["status"],
    ComponentAttendanceRecord["status"]
  > = {
    PRESENT: "present",
    ABSENT: "absent",
    LATE: "late",
    EARLY_LEAVE: "early_leave",
    HOLIDAY: "absent", // HOLIDAYをabsentとして扱う
    SICK_LEAVE: "absent", // SICK_LEAVEをabsentとして扱う
  };

  return {
    id: record.id,
    userId: record.userId,
    userName: record.user.name,
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut,
    breakStart: record.breakStart,
    breakEnd: record.breakEnd,
    workHours: record.workHours,
    overtimeHours: record.overtimeHours,
    status: statusMapping[record.status] || "absent",
    note: record.note || "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

/**
 * 複数の勤怠記録を一括で変換する
 */
export const convertAuthRecordsToComponentRecords = (
  records: AuthAttendanceRecord[]
): ComponentAttendanceRecord[] => {
  return records.map(convertAuthRecordToComponentRecord);
};

/**
 * 勤務時間を計算する
 */
export const calculateWorkHours = (
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

/**
 * 今日の勤怠記録を取得する
 */
export const getTodayRecord = (
  records: AuthAttendanceRecord[],
  userId: string | undefined
): AuthAttendanceRecord | undefined => {
  if (!userId) return undefined;

  const today = new Date().toISOString().split("T")[0];
  return records.find(
    (record) => record.date === today && record.userId === userId
  );
};

/**
 * 現在の勤務ステータスを判定する
 */
export const getCurrentWorkStatus = (
  todayRecord: AuthAttendanceRecord | undefined
): "out" | "in" | "break" => {
  if (!todayRecord) return "out";

  // 退勤済み
  if (todayRecord.clockOut) return "out";

  // 休憩中（休憩開始済みで休憩終了していない）
  if (todayRecord.breakStart && !todayRecord.breakEnd) return "break";

  // 出勤済み（出勤済みで退勤していない）
  if (todayRecord.clockIn) return "in";

  return "out";
};

/**
 * 日付を日本語形式でフォーマットする
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

/**
 * 時刻を日本語形式でフォーマットする
 */
export const formatTime = (timeString: string | null): string => {
  if (!timeString) return "-";

  const time = new Date(timeString);
  return time.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 日付を日本語形式でフォーマットする（別名）
 */
export const formatDateJP = formatDate;

/**
 * 時刻を日本語形式でフォーマットする（別名）
 */
export const formatTimeJP = formatTime;

/**
 * ステータスのラベルを取得する
 */
export const getStatusLabel = (
  status: ComponentAttendanceRecord["status"]
): string => {
  const statusLabels: Record<ComponentAttendanceRecord["status"], string> = {
    present: "出勤",
    absent: "欠勤",
    late: "遅刻",
    early_leave: "早退",
  };

  return statusLabels[status] || "不明";
};
