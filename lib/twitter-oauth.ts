const TWITTER_CLIENT_ID = "UTFPVGg2TnVJZ1NlS1pjYmhTMV86MTpjaQ";

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

// state 검증
export const validateState = (receivedState: string): boolean => {
  const storedState = sessionStorage.getItem("oauth_state");
  return storedState === receivedState;
};

// OAuth 파라미터 정리
export const clearOAuthParams = (): void => {
  sessionStorage.removeItem("oauth_code_verifier");
  sessionStorage.removeItem("oauth_state");
};

// 트위터 로그인 시작
export const startTwitterLogin = async (): Promise<void> => {
  try {
    const authUrl = await createTwitterOAuthUrl();
    console.log("🚀 트위터 OAuth URL로 리다이렉트:", authUrl);
    window.location.href = authUrl;
  } catch (error) {
    console.error("트위터 로그인 시작 실패:", error);
    throw error;
  }
};

// 현재 설정된 리다이렉트 URI 확인 (디버깅용)
export const getCurrentRedirectUri = (): string => {
  return getRedirectUri();
};
