import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { requireAuth, hasPermission } from "@/lib/auth";

// GET /api/users - ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 権限チェック（管理者または店長のみ）
    if (!hasPermission(authResult.user.role, "MANAGER")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const users = await UserService.getAllUsers();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/users - ユーザー作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 権限チェック（管理者のみ）
    if (!hasPermission(authResult.user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, employeeId, password, department, position, role } =
      body;

    // バリデーション
    if (
      !email ||
      !name ||
      !employeeId ||
      !password ||
      !department ||
      !position ||
      !role
    ) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    // メールアドレス形式チェック
    if (!AuthService.validateEmail(email)) {
      return NextResponse.json(
        { error: "正しいメールアドレス形式で入力してください" },
        { status: 400 }
      );
    }

    // パスワード強度チェック
    const passwordValidation = AuthService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // 従業員ID形式チェック（例: EMP001）
    if (!AuthService.validateEmployeeId(employeeId)) {
      return NextResponse.json(
        {
          error:
            "従業員IDは英字3文字+数字3桁の形式で入力してください（例: EMP001）",
        },
        { status: 400 }
      );
    }

    // 既存ユーザーのチェック
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

    // パスワードをハッシュ化
    const hashedPassword = await AuthService.hashPassword(password);

    // ユーザー作成
    const userData = {
      email,
      name,
      employeeId,
      password: hashedPassword,
      department,
      position,
      role: role as "ADMIN" | "MANAGER" | "EMPLOYEE",
    };

    const user = await UserService.createUser(userData);

    return NextResponse.json(
      {
        success: true,
        user,
        message: "ユーザーが正常に作成されました",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    // Prismaのユニーク制約エラーをハンドリング
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        if (error.message.includes("email")) {
          return NextResponse.json(
            { error: "このメールアドレスは既に使用されています" },
            { status: 409 }
          );
        }
        if (error.message.includes("employeeId")) {
          return NextResponse.json(
            { error: "この従業員IDは既に使用されています" },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: "ユーザー作成に失敗しました" },
      { status: 500 }
    );
  }
}
