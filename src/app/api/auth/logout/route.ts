// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "ログアウトしました",
    });

    // クッキーを削除
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "ログアウトに失敗しました" },
      { status: 500 }
    );
  }
}

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

// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { UserService } from "@/lib/prisma";
import { CreateUserRequest } from "@/types/auth";

// ユーザー一覧取得（管理者のみ）
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await UserService.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ユーザー作成（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: CreateUserRequest = await request.json();
    const { email, name, employeeId, password, department, position, role } =
      body;

    // バリデーション
    if (
      !email ||
      !name ||
      !employeeId ||
      !password ||
      !department ||
      !position
    ) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      );
    }

    if (!AuthService.validateEmail(email)) {
      return NextResponse.json(
        { error: "正しいメールアドレス形式で入力してください" },
        { status: 400 }
      );
    }

    if (!AuthService.validateEmployeeId(employeeId)) {
      return NextResponse.json(
        { error: "従業員IDは「AAA000」形式で入力してください（例: EMP001）" },
        { status: 400 }
      );
    }

    const passwordValidation = AuthService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // 重複チェック
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 409 }
      );
    }

    const existingEmployeeId = await UserService.findByEmployeeId(employeeId);
    if (existingEmployeeId) {
      return NextResponse.json(
        { error: "この従業員IDは既に使用されています" },
        { status: 409 }
      );
    }

    // パスワードハッシュ化
    const hashedPassword = await AuthService.hashPassword(password);

    // ユーザー作成
    const newUser = await UserService.createUser({
      email,
      name,
      employeeId,
      password: hashedPassword,
      department,
      position,
      role: role || "EMPLOYEE",
    });

    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
