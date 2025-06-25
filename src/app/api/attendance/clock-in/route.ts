// app/api/attendance/clock-in/route.ts
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 今日の勤怠記録があるかチェック
    const existingRecord = await AttendanceService.getTodayAttendance(
      decoded.userId
    );

    if (existingRecord && existingRecord.clockIn) {
      return NextResponse.json({ error: "既に出勤済みです" }, { status: 400 });
    }

    let record;
    if (existingRecord) {
      // 既存レコードを更新
      record = await AttendanceService.updateAttendanceRecord(
        existingRecord.id,
        {
          clockIn: now,
          status: "PRESENT",
        }
      );
    } else {
      // 新規レコード作成
      record = await AttendanceService.createAttendanceRecord({
        userId: decoded.userId,
        date: today,
        clockIn: now,
        status: "PRESENT",
      });
    }

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        clockIn: record.clockIn?.toISOString(),
        status: record.status,
        updatedAt: record.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Clock in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
