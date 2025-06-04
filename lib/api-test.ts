import { getActiveEvent, getMyThemes, canCreateThemeToday } from "./theme-api";
import { getCurrentUser } from "./auth-api";

// API 연결 테스트 함수
export const testApiConnection = async () => {
  console.log("🔗 API 연결 테스트 시작...");

  try {
    // 1. 활성 이벤트 조회 테스트
    console.log("📅 활성 이벤트 조회 테스트...");
    const activeEvent = await getActiveEvent();
    console.log("✅ 활성 이벤트:", activeEvent);

    // 2. 사용자 정보 조회 테스트 (토큰이 있는 경우)
    const token = localStorage.getItem("auth_token");
    if (token) {
      console.log("👤 사용자 정보 조회 테스트...");
      const user = await getCurrentUser();
      console.log("✅ 사용자 정보:", user);

      // 3. 오늘 테마 작성 가능 여부 테스트
      console.log("📝 오늘 테마 작성 가능 여부 테스트...");
      const canCreate = await canCreateThemeToday();
      console.log("✅ 오늘 작성 가능:", canCreate);

      // 4. 내 테마 목록 조회 테스트
      console.log("📋 내 테마 목록 조회 테스트...");
      const myThemes = await getMyThemes();
      console.log("✅ 내 테마 목록:", myThemes);
    } else {
      console.log("⚠️ 인증 토큰이 없어 사용자 관련 API 테스트를 건너뜁니다.");
    }

    console.log("🎉 모든 API 테스트 완료!");
    return true;
  } catch (error) {
    console.error("❌ API 테스트 실패:", error);
    return false;
  }
};

// 개발자 도구에서 사용할 수 있는 전역 함수로 등록
if (typeof window !== "undefined") {
  (window as any).testApiConnection = testApiConnection;
  console.log(
    "💡 개발자 도구에서 testApiConnection() 함수를 실행하여 API 연결을 테스트할 수 있습니다."
  );
}
