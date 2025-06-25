// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { UserService } from "@/lib/prisma";
import { LoginRequest, LoginResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "メールアドレスとパスワードを入力してください",
        },
        { status: 400 }
      );
    }

    if (!AuthService.validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "正しいメールアドレス形式で入力してください",
        },
        { status: 400 }
      );
    }

    // ユーザー検索
    const user = await UserService.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "メールアドレスまたはパスワードが正しくありません",
        },
        { status: 401 }
      );
    }

    // アクティブユーザーチェック
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "このアカウントは無効になっています" },
        { status: 401 }
      );
    }

    // パスワード検証
    const isPasswordValid = await AuthService.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "メールアドレスまたはパスワードが正しくありません",
        },
        { status: 401 }
      );
    }

    // JWTトークン生成
    const userForToken = {
      id: user.id,
      email: user.email,
      name: user.name,
      employeeId: user.employeeId,
      department: user.department,
      position: user.position,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const token = AuthService.generateToken(userForToken);

    // レスポンス作成
    const response = NextResponse.json<LoginResponse>({
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
      token,
    });

    // HTTPOnlyクッキーに設定
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7日間
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
