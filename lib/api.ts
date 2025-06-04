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

// API 응답 래퍼 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // 토큰이 있으면 Authorization 헤더 추가
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      // 응답 상태에 따른 처리
      if (response.status === 404) {
        console.warn(`Resource not found: ${url}`);
        return null as T;
      }

      if (response.status === 500) {
        console.error(`Server error for ${url}: 500 Internal Server Error`);
        console.error(
          "백엔드 서버에 문제가 있습니다. 백엔드 로그를 확인해주세요."
        );
        throw new Error(`서버 내부 오류 (500): ${endpoint}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status} for ${url}:`, errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`Non-JSON response from ${url}:`, contentType);
        return null as T;
      }

      const apiResponse: ApiResponse<T> = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "API 요청 실패");
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API request failed for ${endpoint}:`, error.message);
      } else {
        console.error("API request failed:", error);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
