// app/api/attendance/break-end/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { AttendanceService } from "@/lib/prisma";

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

    // 日本時間で今日の日付を取得（UTC基準で作成）
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9時間
    const today = new Date(
      Date.UTC(
        jstNow.getUTCFullYear(),
        jstNow.getUTCMonth(),
        jstNow.getUTCDate()
      )
    );

    // 今日の勤怠記録を取得
    const existingRecord = await AttendanceService.getTodayAttendance(
      decoded.userId,
      today
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

    if (!existingRecord.breakStart) {
      return NextResponse.json(
        { error: "休憩を開始していません" },
        { status: 400 }
      );
    }

    if (existingRecord.breakEnd) {
      return NextResponse.json(
        { error: "既に休憩を終了しています" },
        { status: 400 }
      );
    }

    // レコードを更新
    const record = await AttendanceService.updateAttendanceRecord(
      existingRecord.id,
      {
        breakEnd: now,
      }
    );

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        breakEnd: record.breakEnd?.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Break end error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
