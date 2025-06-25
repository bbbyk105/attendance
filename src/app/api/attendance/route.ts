// app/api/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { AttendanceService } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const filters: any = {
      limit,
      offset,
    };

    // 管理者とマネージャーは全員のデータを見れる、一般スタッフは自分のデータのみ
    if (decoded.role === "EMPLOYEE") {
      filters.userId = decoded.userId;
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const records = await AttendanceService.getAttendanceRecords(filters);

    return NextResponse.json({
      success: true,
      records: records.map((record) => ({
        id: record.id,
        userId: record.userId,
        date: record.date.toISOString().split("T")[0],
        clockIn: record.clockIn?.toISOString() || null,
        clockOut: record.clockOut?.toISOString() || null,
        breakStart: record.breakStart?.toISOString() || null,
        breakEnd: record.breakEnd?.toISOString() || null,
        workHours: record.workHours,
        overtimeHours: record.overtimeHours,
        status: record.status,
        note: record.note,
        approvedBy: record.approvedBy,
        approvedAt: record.approvedAt?.toISOString() || null,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        user: record.user,
      })),
    });
  } catch (error) {
    console.error("Get attendance records error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
