// 환경에 따른 기본 API URL 설정
const getDefaultApiUrl = () => {
  if (typeof window !== "undefined") {
    // 브라우저 환경: 현재 도메인 사용 (상대 경로)
    return "";
  }
  // 서버 환경 (SSR): 개발/프로덕션에 따라 분기
  if (process.env.NODE_ENV === "production") {
    return "http://localhost"; // SSR에서 서버 간 통신
  }
  return "http://localhost:8080"; // 개발: 직접 백엔드 연결
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();

// API 서버 상태 체크
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const health = await response.json();
      console.log("✅ 백엔드 서버 상태:", health);
      return true;
    } else {
      console.warn("⚠️ 백엔드 헬스체크 실패:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ 백엔드 서버에 연결할 수 없습니다:", error);
    return false;
  }
}

// 스웨거 UI 접근 가능 여부 확인
export const checkSwaggerAccess = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/swagger-ui/index.html`, {
      method: "GET",
    });

    if (response.ok) {
      console.log("✅ Swagger UI 접근 가능");
      return true;
    } else {
      console.warn("⚠️ Swagger UI 접근 실패:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Swagger UI에 접근할 수 없습니다:", error);
    return false;
  }
};

// 종합적인 백엔드 연결 테스트
export const comprehensiveBackendTest = async () => {
  console.log("🔍 백엔드 종합 연결 테스트 시작...");

  // 1. 기본 연결 테스트
  console.log("1️⃣ 기본 서버 연결 테스트...");
  try {
    const response = await fetch(API_BASE_URL, { method: "GET" });
    console.log(`   서버 응답: ${response.status}`);
  } catch (error) {
    console.error("   서버 연결 실패:", error);
  }

  // 2. 헬스체크 테스트
  console.log("2️⃣ 헬스체크 테스트...");
  await checkApiHealth();

  // 3. Swagger UI 접근 테스트
  console.log("3️⃣ Swagger UI 접근 테스트...");
  await checkSwaggerAccess();

  // 4. API 엔드포인트별 테스트
  console.log("4️⃣ 주요 API 엔드포인트 테스트...");

  const endpoints = ["/api/events/active", "/api/events"];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log(`   ${endpoint}: ${response.status}`);

      if (response.status === 500) {
        console.error(
          `   ❌ ${endpoint}에서 서버 내부 오류 발생 - 백엔드 로그 확인 필요`
        );
      }
    } catch (error) {
      console.error(`   ${endpoint} 테스트 실패:`, error);
    }
  }

  console.log("🎯 백엔드 테스트 완료");
};

// 개발자 도구에서 사용할 수 있도록 전역 함수 등록
if (typeof window !== "undefined") {
  (window as any).checkApiHealth = checkApiHealth;
  (window as any).checkSwaggerAccess = checkSwaggerAccess;
  (window as any).comprehensiveBackendTest = comprehensiveBackendTest;

  console.log("🔧 백엔드 테스트 함수들이 등록되었습니다:");
  console.log("   - checkApiHealth(): 헬스체크");
  console.log("   - checkSwaggerAccess(): Swagger UI 접근 테스트");
  console.log("   - comprehensiveBackendTest(): 종합 테스트");
}
