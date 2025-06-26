import { NextResponse } from "next/server";
import { UserService } from "@/lib/prisma";

// GET /api/auth/users - ログイン用ユーザー一覧取得（アクティブユーザーのみ）
export async function GET() {
  try {
    const allUsers = await UserService.getAllUsers();

    // アクティブユーザーのみをフィルター し、ログインに必要な情報のみを返す
    const activeUsers = allUsers
      .filter((user) => user.isActive)
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        role: user.role,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ja")); // 日本語順でソート

    return NextResponse.json({
      success: true,
      users: activeUsers,
    });
  } catch (error) {
    console.error("Error fetching users for login:", error);
    return NextResponse.json(
      { error: "ユーザー一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
