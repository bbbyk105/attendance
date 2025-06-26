// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { UserService } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Cookieからトークンを取得
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "トークンがありません" },
        { status: 401 }
      );
    }

    // トークンを検証
    const decoded = AuthService.verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "無効なトークンです" },
        { status: 401 }
      );
    }

    // ユーザー情報を取得
    const user = await UserService.findByEmail(decoded.email);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "ユーザーが見つかりません" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, message: "認証チェックに失敗しました" },
      { status: 401 }
    );
  }
}
