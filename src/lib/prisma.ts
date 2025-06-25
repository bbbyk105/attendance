// lib/prisma.ts
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// データベース接続テスト
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// データベース切断
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// トランザクション実行ヘルパー
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}

// データベース初期化（開発用）
export async function initializeDatabase(): Promise<boolean> {
  try {
    // 管理者ユーザーが存在しない場合は作成
    const adminExists = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 12);

      await prisma.user.create({
        data: {
          email: "admin@store.com",
          name: "管理者",
          employeeId: "ADM001",
          password: hashedPassword,
          department: "管理部",
          position: "店長",
          role: "ADMIN",
        },
      });

      console.log("✅ Admin user created");
    }

    // 店舗設定が存在しない場合は作成
    const storeSettings = await prisma.storeSettings.findFirst();

    if (!storeSettings) {
      await prisma.storeSettings.create({
        data: {
          storeName: "店舗名",
          workStartTime: "09:00",
          workEndTime: "18:00",
          breakDuration: 60,
          overtimeThreshold: 8.0,
          timezone: "Asia/Tokyo",
        },
      });

      console.log("✅ Store settings created");
    }

    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

// ユーザー作成時の型定義
interface CreateUserData {
  email: string;
  name: string;
  employeeId: string;
  password: string;
  department: string;
  position: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

// ユーザー更新時の型定義
type UpdateUserData = Partial<Omit<CreateUserData, "password">> & {
  password?: string;
  isActive?: boolean;
};

// ユーザー操作
export class UserService {
  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        employeeId: true,
        password: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async findByEmployeeId(employeeId: string) {
    return await prisma.user.findUnique({
      where: { employeeId },
      select: {
        id: true,
        email: true,
        name: true,
        employeeId: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async createUser(userData: CreateUserData) {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        employeeId: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async updateUser(id: string, updateData: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        employeeId: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        employeeId: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

// 勤怠記録作成時の型定義
interface CreateAttendanceData {
  userId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  workHours?: number;
  overtimeHours?: number;
  status?:
    | "PRESENT"
    | "ABSENT"
    | "LATE"
    | "EARLY_LEAVE"
    | "HOLIDAY"
    | "SICK_LEAVE";
  note?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

// 勤怠記録更新時の型定義
type UpdateAttendanceData = Partial<
  Omit<CreateAttendanceData, "userId" | "date">
>;

// 勤怠記録フィルター時の型定義
interface AttendanceFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// 勤怠記録操作
export class AttendanceService {
  static async getTodayAttendance(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            employeeId: true,
            department: true,
          },
        },
      },
    });
  }

  static async createAttendanceRecord(data: CreateAttendanceData) {
    return await prisma.attendanceRecord.create({
      data,
      include: {
        user: {
          select: {
            name: true,
            employeeId: true,
            department: true,
          },
        },
      },
    });
  }

  static async updateAttendanceRecord(
    id: string,
    updateData: UpdateAttendanceData
  ) {
    return await prisma.attendanceRecord.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            employeeId: true,
            department: true,
          },
        },
      },
    });
  }

  static async getAttendanceRecords(filters: AttendanceFilters) {
    const { userId, startDate, endDate, limit = 50, offset = 0 } = filters;

    const whereClause: Prisma.AttendanceRecordWhereInput = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            employeeId: true,
            department: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });
  }
}
