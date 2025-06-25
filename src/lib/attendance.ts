// utils/attendance.ts
import { AttendanceRecord, CSVExportOptions } from "@/types/attendance";

export const formatTime = (time: string | null): string => {
  if (!time) return "";
  return new Date(time).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

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

export const generateCSV = (
  records: AttendanceRecord[],
  options: CSVExportOptions
): string => {
  const headers = [
    "ユーザーID",
    "ユーザー名",
    "日付",
    "出勤時刻",
    "退勤時刻",
    ...(options.includeBreaks ? ["休憩開始", "休憩終了"] : []),
    "勤務時間",
    "残業時間",
    "ステータス",
    ...(options.includeNotes ? ["備考"] : []),
  ];

  const csvRows = [headers.join(",")];

  records.forEach((record) => {
    const row = [
      record.userId,
      `"${record.userName}"`,
      formatDate(record.date),
      formatTime(record.clockIn),
      formatTime(record.clockOut),
      ...(options.includeBreaks
        ? [formatTime(record.breakStart), formatTime(record.breakEnd)]
        : []),
      record.workHours.toFixed(2),
      record.overtimeHours.toFixed(2),
      getStatusLabel(record.status),
      ...(options.includeNotes ? [`"${record.note}"`] : []),
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getStatusLabel = (status: string): string => {
  const statusMap = {
    present: "出勤",
    absent: "欠勤",
    late: "遅刻",
    early_leave: "早退",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

export const generateFilename = (
  startDate: string,
  endDate: string
): string => {
  const start = formatDate(startDate).replace(/\//g, "");
  const end = formatDate(endDate).replace(/\//g, "");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
  return `勤怠データ_${start}_${end}_${timestamp}.csv`;
};
