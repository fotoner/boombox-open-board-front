const TWITTER_CLIENT_ID = "UTFPVGg2TnVJZ1NlS1pjYmhTMV86MTpjaQ";
import {
  trackOAuthStateValidationFailed,
  trackOAuthError,
  trackOAuthSuccess,
} from "./gtag";

// 플랫폼 감지 유틸리티
const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// 디버깅 정보 수집
const collectDebugInfo = () => {
  if (typeof window === "undefined") return {};

  return {
    userAgent: navigator.userAgent,
    isMobile: isMobile(),
    hasSessionStorage: !!window.sessionStorage,
    origin: window.location.origin,
    timestamp: new Date().toISOString(),
  };
};

// 현재 환경에 맞는 리다이렉트 URI 생성
const getRedirectUri = (): string => {
  if (typeof window === "undefined") {
    return "http://localhost:3000/login-redirect"; // SSR 기본값
  }

  const origin = window.location.origin;
  return `${origin}/login-redirect`;
};

// PKCE (Proof Key for Code Exchange) 유틸리티
export const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const generateCodeChallenge = async (
  verifier: string
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(digest)))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const generateState = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// 트위터 OAuth URL 생성
export const createTwitterOAuthUrl = async (): Promise<string> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();
  const redirectUri = getRedirectUri();

  // PKCE 파라미터들을 sessionStorage에 저장
  sessionStorage.setItem("oauth_code_verifier", codeVerifier);
  sessionStorage.setItem("oauth_state", state);

  // 디버깅을 위해 리다이렉트 URI도 로그 출력
  console.log("🔗 OAuth 리다이렉트 URI:", redirectUri);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "tweet.read users.read",
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `https://x.com/i/oauth2/authorize?${params.toString()}`;
};

// 로그인 리다이렉트에서 인증 코드 추출
export const extractAuthCodeFromUrl = (
  url: string = window.location.href
): { code: string | null; state: string | null; error: string | null } => {
  const urlParams = new URLSearchParams(new URL(url).search);

  return {
    code: urlParams.get("code"),
    state: urlParams.get("state"),
    error: urlParams.get("error"),
  };
};

// state 검증 (개선된 버전)
export const validateState = (
  receivedState: string
): {
  isValid: boolean;
  error?: string;
  shouldRetry?: boolean;
  debugInfo?: any;
} => {
  try {
    const storedState = sessionStorage.getItem("oauth_state");

    if (storedState === receivedState) {
      // 성공 시 애널리틱스 추적
      trackOAuthSuccess("twitter");
      return { isValid: true };
    }

    // 실패 시 디버깅 정보 수집
    const debugInfo = collectDebugInfo();
    console.warn("🚨 OAuth State 검증 실패", {
      received: receivedState,
      stored: storedState,
      ...debugInfo,
    });

    // 애널리틱스로 검증 실패 추적 (앞 5자리만 안전하게)
    trackOAuthStateValidationFailed({
      ...debugInfo,
      receivedState: receivedState
        ? receivedState.substring(0, 5) + "..."
        : "null",
      storedState: storedState ? storedState.substring(0, 5) + "..." : "null",
    });

    // 모바일 환경에서의 사용자 친화적 오류 메시지
    const isMobileDevice = isMobile();
    const errorMessage = isMobileDevice
      ? "앱 전환 중 로그인 정보가 손실되었습니다. 잠시 후 자동으로 다시 시도하거나 메인 페이지에서 다시 로그인해주세요."
      : "로그인 중 보안 검증에 실패했습니다. 잠시 후 자동으로 다시 시도하거나 메인 페이지에서 다시 로그인해주세요.";

    return {
      isValid: false,
      error: errorMessage,
      shouldRetry: true,
      debugInfo,
    };
  } catch (error) {
    console.error("State 검증 중 오류 발생:", error);

    const debugInfo = collectDebugInfo();

    // 예외 상황도 애널리틱스로 추적
    trackOAuthError(
      "state_validation_exception",
      error instanceof Error ? error.message : "unknown_error",
      debugInfo
    );

    return {
      isValid: false,
      error:
        "로그인 처리 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.",
      shouldRetry: true,
    };
  }
};

// 강화된 OAuth 파라미터 정리
export const clearOAuthParams = (): void => {
  try {
    sessionStorage.removeItem("oauth_code_verifier");
    sessionStorage.removeItem("oauth_state");
    console.log("✅ OAuth 파라미터 정리 완료");
  } catch (error) {
    console.warn("OAuth 파라미터 정리 중 오류:", error);
  }
};

// 개선된 트위터 로그인 시작
export const startTwitterLogin = async (): Promise<void> => {
  try {
    // 기존 실패한 세션 정리
    clearOAuthParams();

    const authUrl = await createTwitterOAuthUrl();
    console.log("🚀 트위터 OAuth URL로 리다이렉트:", authUrl);

    // 모바일 환경에서 추가 안내
    if (isMobile()) {
      console.log("📱 모바일 환경 감지: 앱 전환이 발생할 수 있습니다.");
    }

    window.location.href = authUrl;
  } catch (error) {
    console.error("트위터 로그인 시작 실패:", error);

    // 로그인 시작 실패도 애널리틱스로 추적
    const debugInfo = collectDebugInfo();
    trackOAuthError(
      "login_start_failed",
      error instanceof Error ? error.message : "unknown_error",
      debugInfo
    );

    throw error;
  }
};

// 현재 설정된 리다이렉트 URI 확인 (디버깅용)
export const getCurrentRedirectUri = (): string => {
  return getRedirectUri();
};
