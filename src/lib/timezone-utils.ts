// lib/timezone-utils.ts
/**
 * 日本時間での今日の日付をUTC基準で取得
 * データベースのDATEカラムと一致させるため
 */
export function getJSTTodayAsUTC(): Date {
  const now = new Date();
  // 日本時間（UTC+9）に変換
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  // UTC基準で日付のみを作成（時間は00:00:00）
  return new Date(
    Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate())
  );
}

/**
 * 日本時間の指定された日付をUTC基準のDATEに変換
 * @param jstDate 日本時間の日付
 */
export function getJSTDateAsUTC(jstDate: Date): Date {
  return new Date(
    Date.UTC(jstDate.getFullYear(), jstDate.getMonth(), jstDate.getDate())
  );
}

/**
 * 指定した日付が日本時間で今日かどうかを判定
 */
export function isJSTToday(date: Date): boolean {
  const today = getJSTTodayAsUTC();
  const targetDate = new Date(date.getTime());

  return (
    targetDate.getUTCFullYear() === today.getUTCFullYear() &&
    targetDate.getUTCMonth() === today.getUTCMonth() &&
    targetDate.getUTCDate() === today.getUTCDate()
  );
}

/**
 * 日本時間の現在時刻を取得
 */
export function getJSTNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000);
}

/**
 * UTC時刻を日本時間に変換
 */
export function utcToJST(utcDate: Date): Date {
  return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
}

/**
 * 日本時間をUTCに変換
 */
export function jstToUTC(jstDate: Date): Date {
  return new Date(jstDate.getTime() - 9 * 60 * 60 * 1000);
}
