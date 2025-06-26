// app/api/debug/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 6月25日のレコードを削除（テスト用に作成された間違った日付のレコード）
    const deleteResult = await (prisma as any).attendanceRecord.deleteMany({
      where: {
        date: {
          gte: new Date("2025-06-25T00:00:00.000Z"),
          lt: new Date("2025-06-26T00:00:00.000Z"),
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: "古いテストレコードを削除しました",
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST リクエストで古いレコードを削除できます",
    warning: "この操作は取り消せません",
  });
}
