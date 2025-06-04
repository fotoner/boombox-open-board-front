import { apiClient } from "./api";
import type { Theme } from "@/types/theme";

export interface CreateThemeRequest {
  title: string;
  content: string;
  eventId: number;
}

export interface UpdateThemeRequest {
  title: string;
  content: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxThemes: number;
  isPublic: boolean;
}

export interface UpdateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxThemes: number;
  isPublic: boolean;
}

export interface ThemeResponse {
  id: number;
  title: string;
  content: string;
  status: string;
  viewCount: number;
  isHidden: boolean;
  hiddenReason?: string;
  createdAt: string;
  updatedAt?: string;
  authorName: string;
  authorUsername: string;
  eventTitle: string;
  author?: {
    id: number;
    username: string;
    name: string;
    picture: string;
  };
  event?: {
    id: number;
    title: string;
    isActive: boolean;
  };
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  maxThemes: number;
  isPublic: boolean;
  currentThemeCount: number;
  isActive: boolean;
  isUpcoming: boolean;
  isEnded: boolean;
  canSubmitTheme: boolean;
  createdAt: string;
  updatedAt: string;
}

// 현재 활성 이벤트 조회
export const getActiveEvent = async (): Promise<EventResponse | null> => {
  try {
    const response = await apiClient.get<EventResponse>("/api/events/active");
    return response;
  } catch (error) {
    console.error("Failed to fetch active event:", error);
    return null;
  }
};

// 이벤트 목록 조회
export const getEvents = async (
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<EventResponse>> => {
  try {
    const response = await apiClient.get<PagedResponse<EventResponse>>(
      `/api/events?page=${page}&size=${size}&sort=createdAt,desc`
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    throw error;
  }
};

// 이벤트 상세 조회
export const getEvent = async (eventId: number): Promise<EventResponse> => {
  try {
    const response = await apiClient.get<EventResponse>(
      `/api/events/${eventId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch event:", error);
    throw error;
  }
};

// 📋 관리자 전용 - 이벤트 생성
export const createEvent = async (
  eventData: CreateEventRequest
): Promise<EventResponse> => {
  try {
    const response = await apiClient.post<EventResponse>(
      "/api/events",
      eventData
    );
    console.log("✅ 이벤트 생성 성공:", response.title);
    return response;
  } catch (error) {
    console.error("Failed to create event:", error);
    throw error;
  }
};

// 📋 관리자 전용 - 이벤트 수정
export const updateEvent = async (
  eventId: number,
  eventData: UpdateEventRequest
): Promise<EventResponse> => {
  try {
    const response = await apiClient.put<EventResponse>(
      `/api/events/${eventId}`,
      eventData
    );
    console.log("✅ 이벤트 수정 성공:", response.title);
    return response;
  } catch (error) {
    console.error("Failed to update event:", error);
    throw error;
  }
};

// 📋 관리자 전용 - 이벤트 삭제
export const deleteEvent = async (eventId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/events/${eventId}`);
    console.log("✅ 이벤트 삭제 성공");
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw error;
  }
};

// 테마 목록 조회
export const getThemes = async (
  eventId: number,
  page: number = 0,
  size: number = 20
): Promise<Theme[]> => {
  try {
    const response = await apiClient.get<PagedResponse<ThemeResponse>>(
      `/api/themes?eventId=${eventId}&page=${page}&size=${size}&sort=createdAt,desc`
    );

    return response.content.map((theme) => ({
      id: theme.id.toString(),
      content: theme.title || theme.content,
      author: theme.authorUsername,
      authorNickname: theme.authorName,
      createdAt: new Date(theme.createdAt),
      createdByMe: false, // 이 정보는 별도로 확인 필요
    }));
  } catch (error) {
    console.error("Failed to fetch themes:", error);
    throw error;
  }
};

// 내가 작성한 테마 목록 조회
export const getMyThemes = async (
  page: number = 0,
  size: number = 20
): Promise<Theme[]> => {
  try {
    const response = await apiClient.get<PagedResponse<ThemeResponse>>(
      `/api/themes/my?page=${page}&size=${size}&sort=createdAt,desc`
    );

    return response.content.map((theme) => ({
      id: theme.id.toString(),
      content: theme.title || theme.content,
      author: theme.authorUsername,
      authorNickname: theme.authorName,
      createdAt: new Date(theme.createdAt),
      createdByMe: true,
    }));
  } catch (error) {
    console.error("Failed to fetch my themes:", error);
    throw error;
  }
};

// 📋 관리자 전용 - 전체 테마 관리 목록 조회
export const getAdminThemes = async (
  page: number = 0,
  size: number = 20,
  status?: string,
  includeHidden: boolean = false
): Promise<PagedResponse<ThemeResponse>> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: "createdAt,desc",
      includeHidden: includeHidden.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    const response = await apiClient.get<PagedResponse<ThemeResponse>>(
      `/api/themes/admin?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch admin themes:", error);
    throw error;
  }
};

// 테마 상세 조회
export const getTheme = async (themeId: number): Promise<ThemeResponse> => {
  try {
    const response = await apiClient.get<ThemeResponse>(
      `/api/themes/${themeId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch theme:", error);
    throw error;
  }
};

// 테마 생성
export const createTheme = async (
  title: string,
  content: string,
  eventId: number
): Promise<Theme> => {
  try {
    const request: CreateThemeRequest = { title, content, eventId };
    const response = await apiClient.post<ThemeResponse>(
      "/api/themes",
      request
    );

    return {
      id: response.id.toString(),
      content: response.title || response.content,
      author: response.authorUsername,
      authorNickname: response.authorName,
      createdAt: new Date(response.createdAt),
      createdByMe: true,
    };
  } catch (error) {
    console.error("Failed to create theme:", error);
    throw error;
  }
};

// 테마 수정
export const updateTheme = async (
  themeId: number,
  title: string,
  content: string
): Promise<ThemeResponse> => {
  try {
    const request: UpdateThemeRequest = { title, content };
    const response = await apiClient.put<ThemeResponse>(
      `/api/themes/${themeId}`,
      request
    );
    return response;
  } catch (error) {
    console.error("Failed to update theme:", error);
    throw error;
  }
};

// 테마 삭제
export const deleteTheme = async (themeId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/themes/${themeId}`);
  } catch (error) {
    console.error("Failed to delete theme:", error);
    throw error;
  }
};

// 📋 관리자 전용 - 테마 상태 변경
export const updateThemeStatus = async (
  themeId: number,
  status: string
): Promise<void> => {
  try {
    await apiClient.patch(`/api/themes/${themeId}/status?status=${status}`);
    console.log("✅ 테마 상태 변경 성공:", themeId, "→", status);
  } catch (error) {
    console.error("Failed to update theme status:", error);
    throw error;
  }
};

// 📋 관리자 전용 - 테마 숨기기
export const hideTheme = async (
  themeId: number,
  reason?: string
): Promise<void> => {
  try {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    await apiClient.patch(`/api/themes/${themeId}/hide${params}`);
    console.log("✅ 테마 숨김 처리 성공:", themeId);
  } catch (error) {
    console.error("Failed to hide theme:", error);
    throw error;
  }
};

// 📋 관리자 전용 - 테마 숨김 해제
export const unhideTheme = async (themeId: number): Promise<void> => {
  try {
    await apiClient.patch(`/api/themes/${themeId}/unhide`);
    console.log("✅ 테마 숨김 해제 성공:", themeId);
  } catch (error) {
    console.error("Failed to unhide theme:", error);
    throw error;
  }
};

// 오늘 테마 작성 가능 여부 확인
export const canCreateThemeToday = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<boolean>(
      "/api/themes/can-create-today"
    );
    return response;
  } catch (error) {
    console.error("Failed to check if can create theme today:", error);
    return false;
  }
};
