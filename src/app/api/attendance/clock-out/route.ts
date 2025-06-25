// app/api/attendance/clock-out/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { AttendanceService } from "@/lib/prisma";

function calculateWorkHours(
  clockIn: Date,
  clockOut: Date,
  breakStart: Date | null,
  breakEnd: Date | null
): { workHours: number; overtimeHours: number } {
  let workTime = clockOut.getTime() - clockIn.getTime();

  if (breakStart && breakEnd) {
    const breakTime = breakEnd.getTime() - breakStart.getTime();
    workTime -= breakTime;
  }

  const workHours = Math.max(0, workTime / (1000 * 60 * 60));
  const overtimeHours = Math.max(0, workHours - 8); // 8時間を超えた分を残業とする

  return { workHours, overtimeHours };
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const now = new Date();

    // 今日の勤怠記録を取得
    const existingRecord = await AttendanceService.getTodayAttendance(
      decoded.userId
    );

    if (!existingRecord || !existingRecord.clockIn) {
      return NextResponse.json(
        { error: "出勤記録がありません" },
        { status: 400 }
      );
    }

    if (existingRecord.clockOut) {
      return NextResponse.json({ error: "既に退勤済みです" }, { status: 400 });
    }

    // 勤務時間と残業時間を計算
    const { workHours, overtimeHours } = calculateWorkHours(
      existingRecord.clockIn,
      now,
      existingRecord.breakStart,
      existingRecord.breakEnd
    );

    // レコードを更新
    const record = await AttendanceService.updateAttendanceRecord(
      existingRecord.id,
      {
        clockOut: now,
        workHours,
        overtimeHours,
      }
    );

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        clockOut: record.clockOut?.toISOString(),
        workHours: record.workHours,
        overtimeHours: record.overtimeHours,
        updatedAt: record.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Clock out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
