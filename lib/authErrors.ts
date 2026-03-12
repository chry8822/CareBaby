const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'User already registered': '이미 가입된 이메일입니다.',
  'Email not confirmed': '이메일 인증을 완료해주세요.',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
};

export function getAuthErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof Error) {
    for (const [key, korean] of Object.entries(ERROR_MAP)) {
      if (err.message.includes(key)) return korean;
    }
    return fallback ?? err.message;
  }
  return fallback ?? '알 수 없는 오류가 발생했습니다.';
}
