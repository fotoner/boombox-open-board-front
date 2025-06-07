import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  mapRole,
} from "@/lib/auth-api";
import { startTwitterLogin } from "@/lib/twitter-oauth";

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (code: string, codeVerifier: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  startLogin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,

      startLogin: async () => {
        try {
          await startTwitterLogin();
        } catch (error) {
          console.error("트위터 로그인 시작 실패:", error);
          throw error;
        }
      },

      login: async (code: string, codeVerifier: string) => {
        set({ isLoading: true });
        try {
          console.log("🔄 로그인 처리 시작...");

          const loginResponse = await apiLogin(code, codeVerifier);
          const userInfo = await getCurrentUser();

          if (userInfo) {
            const user: User = {
              id: userInfo.username,
              nickname: userInfo.name,
              avatar: userInfo.picture || "/placeholder.svg?height=40&width=40",
              role: mapRole(userInfo.role),
            };

            console.log("✅ 로그인 완료:", user.nickname, `(${user.role})`);
            set({ isLoggedIn: true, user, isLoading: false });
          } else {
            throw new Error("사용자 정보를 가져올 수 없습니다.");
          }
        } catch (error) {
          console.error("Login failed:", error);
          set({ isLoggedIn: false, user: null, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiLogout();
          set({ isLoggedIn: false, user: null, isLoading: false });
        } catch (error) {
          console.error("Logout failed:", error);
          // 로그아웃 실패해도 로컬 상태는 초기화
          set({ isLoggedIn: false, user: null, isLoading: false });
        }
      },

      initializeAuth: async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          set({ isLoggedIn: false, user: null, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const userInfo = await getCurrentUser();

          if (userInfo) {
            const user: User = {
              id: userInfo.username,
              nickname: userInfo.name,
              avatar: userInfo.picture || "/placeholder.svg?height=40&width=40",
              role: mapRole(userInfo.role),
            };

            console.log(
              "🔄 인증 초기화 완료:",
              user.nickname,
              `(${user.role})`
            );
            set({ isLoggedIn: true, user, isLoading: false });
          } else {
            set({ isLoggedIn: false, user: null, isLoading: false });
          }
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          set({ isLoggedIn: false, user: null, isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }),
    }
  )
);

// 트위터 OAuth URL 생성 (실제 환경에서는 백엔드에서 제공해야 함)
export const getTwitterOAuthUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    window.location.origin + "/auth/callback"
  );
  const state = Math.random().toString(36).substring(7);

  // state를 세션스토리지에 저장
  sessionStorage.setItem("oauth_state", state);

  return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.read%20users.read&state=${state}`;
};

// 목업 로그인 함수 (개발용)
export const mockLogin = () => {
  const mockCode = "mock_auth_code_" + Date.now();
  const mockCodeVerifier = "mock_code_verifier_" + Date.now();
  useAuthStore
    .getState()
    .login(mockCode, mockCodeVerifier)
    .catch(console.error);
};
