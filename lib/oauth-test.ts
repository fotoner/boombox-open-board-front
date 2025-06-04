import {
  createTwitterOAuthUrl,
  extractAuthCodeFromUrl,
  validateState,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  getCurrentRedirectUri,
} from "./twitter-oauth";

// OAuth 파라미터 생성 테스트
export const testOAuthParameterGeneration = async () => {
  console.log("🔧 OAuth 파라미터 생성 테스트...");

  try {
    const redirectUri = getCurrentRedirectUri();
    console.log("✅ 현재 리다이렉트 URI:", redirectUri);

    const codeVerifier = generateCodeVerifier();
    console.log("✅ Code Verifier:", codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);
    console.log("✅ Code Challenge:", codeChallenge);

    const state = generateState();
    console.log("✅ State:", state);

    const authUrl = await createTwitterOAuthUrl();
    console.log("✅ OAuth URL 생성 성공:", authUrl);

    return true;
  } catch (error) {
    console.error("❌ OAuth 파라미터 생성 실패:", error);
    return false;
  }
};

// PKCE 플로우 검증 테스트
export const testPKCEFlow = async () => {
  console.log("🔐 PKCE 플로우 검증 테스트...");

  try {
    // 1. Code Verifier 생성
    const codeVerifier = generateCodeVerifier();
    console.log(
      "1️⃣ Code Verifier 생성:",
      codeVerifier.substring(0, 20) + "..."
    );

    // 2. Code Challenge 생성
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    console.log(
      "2️⃣ Code Challenge 생성:",
      codeChallenge.substring(0, 20) + "..."
    );

    // 3. sessionStorage에 저장 시뮬레이션
    const originalVerifier = sessionStorage.getItem("oauth_code_verifier");
    sessionStorage.setItem("oauth_code_verifier", codeVerifier);

    // 4. 저장된 값 검증
    const storedVerifier = sessionStorage.getItem("oauth_code_verifier");
    const isVerifierMatch = storedVerifier === codeVerifier;
    console.log(
      "3️⃣ Code Verifier 저장/복원 검증:",
      isVerifierMatch ? "✅ 성공" : "❌ 실패"
    );

    // 5. 정리
    if (originalVerifier) {
      sessionStorage.setItem("oauth_code_verifier", originalVerifier);
    } else {
      sessionStorage.removeItem("oauth_code_verifier");
    }

    console.log("✅ PKCE 플로우 검증 완료!");
    return true;
  } catch (error) {
    console.error("❌ PKCE 플로우 검증 실패:", error);
    return false;
  }
};

// URL 파싱 테스트
export const testUrlParsing = () => {
  console.log("🔧 URL 파싱 테스트...");

  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  // 테스트 URL들 (현재 도메인 기반)
  const testUrls = [
    `${currentOrigin}/login-redirect?code=test123&state=abc456`,
    `${currentOrigin}/login-redirect?error=access_denied&state=abc456`,
    `${currentOrigin}/login-redirect`,
  ];

  testUrls.forEach((url, index) => {
    console.log(`테스트 ${index + 1}: ${url}`);
    const result = extractAuthCodeFromUrl(url);
    console.log("   결과:", result);
  });
};

// State 검증 테스트
export const testStateValidation = () => {
  console.log("🔧 State 검증 테스트...");

  // 테스트 state 설정
  const testState = "test_state_123";
  sessionStorage.setItem("oauth_state", testState);

  // 검증 테스트
  console.log("✅ 올바른 state 검증:", validateState(testState));
  console.log("❌ 잘못된 state 검증:", validateState("wrong_state"));

  // 정리
  sessionStorage.removeItem("oauth_state");
};

// 환경별 설정 확인
export const checkEnvironmentSettings = () => {
  console.log("🌍 환경별 설정 확인:");
  console.log(
    "Current Origin:",
    typeof window !== "undefined" ? window.location.origin : "SSR 환경"
  );
  console.log("Redirect URI:", getCurrentRedirectUri());
  console.log("Environment:", process.env.NODE_ENV);

  if (typeof window !== "undefined") {
    console.log("Protocol:", window.location.protocol);
    console.log("Host:", window.location.host);
    console.log("Pathname:", window.location.pathname);
  }
};

// 백엔드 로그인 시뮬레이션 테스트
export const testBackendLoginFlow = () => {
  console.log("🚀 백엔드 로그인 플로우 시뮬레이션...");

  const mockCode = "mock_code_12345";
  const mockCodeVerifier =
    sessionStorage.getItem("oauth_code_verifier") || "mock_verifier_12345";

  console.log("📤 백엔드로 전송될 데이터:");
  console.log("  - code:", mockCode);
  console.log("  - codeVerifier:", mockCodeVerifier.substring(0, 20) + "...");

  console.log("💡 실제 요청 형태:");
  console.log(`  POST /auth/login`);
  console.log(`  Content-Type: application/json`);
  console.log(`  Body: {`);
  console.log(`    "code": "${mockCode}",`);
  console.log(`    "codeVerifier": "${mockCodeVerifier.substring(0, 20)}..."`);
  console.log(`  }`);

  console.log("✅ 백엔드 PKCE 플로우 준비 완료!");
};

// 종합 OAuth 테스트
export const comprehensiveOAuthTest = async () => {
  console.log("🚀 종합 OAuth 테스트 시작...");

  console.log("\n0️⃣ 환경 설정 확인");
  checkEnvironmentSettings();

  console.log("\n1️⃣ 파라미터 생성 테스트");
  await testOAuthParameterGeneration();

  console.log("\n2️⃣ PKCE 플로우 검증");
  await testPKCEFlow();

  console.log("\n3️⃣ URL 파싱 테스트");
  testUrlParsing();

  console.log("\n4️⃣ State 검증 테스트");
  testStateValidation();

  console.log("\n5️⃣ 백엔드 로그인 플로우 시뮬레이션");
  testBackendLoginFlow();

  console.log("\n🎉 모든 OAuth 테스트 완료!");

  console.log("\n📝 실제 로그인 테스트를 위해:");
  console.log("1. 메인 페이지에서 로그인 버튼 클릭");
  console.log("2. 트위터에서 권한 승인");
  console.log("3. 리다이렉트 페이지에서 로그인 처리 확인");
  console.log("4. 개발자 도구에서 네트워크 탭으로 PKCE 요청 확인");

  const currentRedirectUri = getCurrentRedirectUri();
  console.log(`\n🔗 현재 리다이렉트 URI: ${currentRedirectUri}`);
  console.log("트위터 개발자 콘솔에서 이 URI가 등록되어 있는지 확인하세요!");
};

// 현재 OAuth 상태 확인 (PKCE 포함)
export const checkOAuthState = () => {
  console.log("📋 현재 OAuth 상태:");

  const codeVerifier = sessionStorage.getItem("oauth_code_verifier");
  const state = sessionStorage.getItem("oauth_state");
  const authToken = localStorage.getItem("auth_token");

  console.log(
    "Code Verifier:",
    codeVerifier ? codeVerifier.substring(0, 20) + "..." : "null"
  );
  console.log("State:", state ? state.substring(0, 20) + "..." : "null");
  console.log(
    "Auth Token:",
    authToken ? authToken.substring(0, 20) + "..." : "null"
  );
  console.log("Current Redirect URI:", getCurrentRedirectUri());

  // PKCE 플로우 상태 진단
  if (codeVerifier && state) {
    console.log("🟢 PKCE 파라미터가 준비되어 있습니다.");
  } else if (!codeVerifier && !state) {
    console.log("🟡 PKCE 파라미터가 없습니다. (정상 - 로그인 전 상태)");
  } else {
    console.log(
      "🟠 PKCE 파라미터가 불완전합니다. clearOAuthSession() 실행 권장."
    );
  }

  if (authToken) {
    console.log("🟢 로그인 상태입니다.");
  } else {
    console.log("🔴 로그아웃 상태입니다.");
  }
};

// OAuth 세션 정리
export const clearOAuthSession = () => {
  sessionStorage.removeItem("oauth_code_verifier");
  sessionStorage.removeItem("oauth_state");
  localStorage.removeItem("auth_token");
  console.log("✅ OAuth 세션이 정리되었습니다.");
};

// 개발자 도구에서 사용할 수 있도록 전역 함수 등록
if (typeof window !== "undefined") {
  (window as any).testOAuthParameterGeneration = testOAuthParameterGeneration;
  (window as any).testPKCEFlow = testPKCEFlow;
  (window as any).testUrlParsing = testUrlParsing;
  (window as any).testStateValidation = testStateValidation;
  (window as any).testBackendLoginFlow = testBackendLoginFlow;
  (window as any).checkEnvironmentSettings = checkEnvironmentSettings;
  (window as any).comprehensiveOAuthTest = comprehensiveOAuthTest;
  (window as any).checkOAuthState = checkOAuthState;
  (window as any).clearOAuthSession = clearOAuthSession;

  console.log("🔧 OAuth 테스트 함수들이 등록되었습니다:");
  console.log("   - checkEnvironmentSettings(): 환경 설정 확인");
  console.log(
    "   - testOAuthParameterGeneration(): OAuth 파라미터 생성 테스트"
  );
  console.log("   - testPKCEFlow(): PKCE 플로우 검증 테스트");
  console.log("   - testUrlParsing(): URL 파싱 테스트");
  console.log("   - testStateValidation(): State 검증 테스트");
  console.log("   - testBackendLoginFlow(): 백엔드 로그인 플로우 시뮬레이션");
  console.log("   - comprehensiveOAuthTest(): 종합 OAuth 테스트");
  console.log("   - checkOAuthState(): 현재 OAuth 상태 확인 (PKCE 포함)");
  console.log("   - clearOAuthSession(): OAuth 세션 정리");
}
