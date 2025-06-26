import {
  disconnectDatabase,
  initializeDatabase,
  testDatabaseConnection,
} from "@/lib/prisma";

async function main() {
  console.log("🚀 データベース初期化開始...");

  // 接続テスト
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.error("❌ データベース接続に失敗しました");
    process.exit(1);
  }

  // 初期データ作成
  const isInitialized = await initializeDatabase();
  if (!isInitialized) {
    console.error("❌ データベース初期化に失敗しました");
    process.exit(1);
  }

  console.log("✅ データベース初期化完了！");
  console.log("");
  console.log("🎉 管理者アカウントが作成されました:");
  console.log("   Email: admin@store.com");
  console.log("   Password: admin123");
  console.log("");
  console.log("📋 店舗設定も作成されました");
  console.log("");
  console.log("🌐 Prisma Studioでデータを確認できます:");
  console.log("   http://localhost:5555");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
