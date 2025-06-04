export interface User {
  id: string; // 소셜 아이디 (@handle)
  nickname: string; // 표시용 닉네임
  avatar?: string; // 프로필 이미지 (선택사항)
  role: "ADMIN" | "USER" | "GUEST"; // 사용자 역할
}

// 역할별 권한 확인 유틸리티
export const isAdmin = (user: User | null): boolean => {
  return user?.role === "ADMIN";
};

export const isUser = (user: User | null): boolean => {
  return user?.role === "USER" || user?.role === "ADMIN";
};

export const canManageEvents = (user: User | null): boolean => {
  return user?.role === "ADMIN";
};

export const canManageThemes = (user: User | null): boolean => {
  return user?.role === "ADMIN";
};

export const canCreateThemes = (user: User | null): boolean => {
  return user?.role === "USER" || user?.role === "ADMIN";
};
