import { apiClient } from "./api";

export interface LoginRequest {
  code: string;
  codeVerifier: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UserResponse {
  userId: number;
  username: string;
  name: string;
  email: string;
  isPublic: boolean;
  introduce: string;
  picture: string;
  socialLink: string;
  role: string;
}

// 역할 매핑 함수
const mapRole = (koreanRole: string): "ADMIN" | "USER" | "GUEST" => {
  switch (koreanRole) {
    case "관리자":
      return "ADMIN";
    case "사용자":
      return "USER";
    case "게스트":
      return "GUEST";
    default:
      return "GUEST";
  }
};

// 트위터 로그인 URL 가져오기
export const getTwitterLoginUrl = async (): Promise<string> => {
  try {
    const response = await apiClient.get<{ loginUrl: string }>(
      "/api/auth/twitter/login-url"
    );
    return response.loginUrl;
  } catch (error) {
    console.error("Failed to get Twitter login URL:", error);
    throw error;
  }
};

// 로그인 (트위터 콜백 처리)
export const login = async (
  code: string,
  codeVerifier: string
): Promise<LoginResponse> => {
  try {
    const request: LoginRequest = {
      code,
      codeVerifier,
    };

    console.log("🔐 백엔드 로그인 요청:", {
      code: code.substring(0, 10) + "...",
      codeVerifier: codeVerifier.substring(0, 10) + "...",
    });

    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      request
    );

    // 토큰을 로컬스토리지에 저장
    localStorage.setItem("auth_token", response.accessToken);

    console.log("✅ 로그인 성공, 토큰 저장됨");
    return response;
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
};

// 로그아웃
export const logout = async (): Promise<void> => {
  try {
    // 로컬스토리지에서 토큰 제거
    localStorage.removeItem("auth_token");
    console.log("✅ 로그아웃 완료");
  } catch (error) {
    console.error("Failed to logout:", error);
  }
};

// 현재 사용자 정보 조회
export const getCurrentUser = async (): Promise<UserResponse | null> => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      return null;
    }

    const response = await apiClient.get<UserResponse>("/user/me");
    console.log(
      "✅ 사용자 정보 조회 성공:",
      response.username,
      `(${response.role})`
    );
    return response;
  } catch (error) {
    console.error("Failed to get current user:", error);
    // 토큰이 유효하지 않으면 제거
    localStorage.removeItem("auth_token");
    return null;
  }
};

// 토큰 새로고침
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await apiClient.post<{ token: string }>(
      "/api/auth/refresh"
    );
    localStorage.setItem("auth_token", response.token);
    return response.token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("auth_token");
    return null;
  }
};

// 역할 매핑 함수 내보내기
export { mapRole };
