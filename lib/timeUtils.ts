/**
 * 생후 일수 계산 (timezone 무관 — 날짜 문자열의 년/월/일만 사용)
 */
export function getDaysSinceBirth(birthDate: string): number {
  const parts = birthDate.split('T')[0].split('-').map(Number);
  const birthUTC = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((todayUTC - birthUTC) / (1000 * 60 * 60 * 24));
}

/**
 * 경과 시간 포맷 (초 → "N분 전" / "N시간 N분 전")
 * 60초 미만: "방금 전"
 */
export function formatElapsed(seconds: number): string {
  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (m === 0) return `${h}시간 전`;
  return `${h}시간 ${m}분 전`;
}

/**
 * 시간대별 인사말
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '좋은 아침이에요';
  if (hour >= 12 && hour < 18) return '좋은 오후예요';
  if (hour >= 18 && hour < 22) return '좋은 저녁이에요';
  return '늦은 밤이네요';
}

/**
 * 지속 시간 포맷 (초 → "12분 30초" / "1시간 2분")
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    if (m > 0) return `${h}시간 ${m}분`;
    return `${h}시간`;
  }
  if (m > 0) {
    if (s > 0) return `${m}분 ${s}초`;
    return `${m}분`;
  }
  return `${s}초`;
}

/**
 * 시각 포맷 (Date | string → "HH:MM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
