// Google Analytics 설정
export const GA_TRACKING_ID = "G-3D60HP7JP2";

// 페이지뷰 추적
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// 이벤트 추적
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 커스텀 이벤트들
export const trackThemeSubmit = (themeContent: string) => {
  event({
    action: "theme_submit",
    category: "engagement",
    label: themeContent.substring(0, 50), // 처음 50자만 추적
  });
};

export const trackThemeShare = (themeId: string, platform = "twitter") => {
  event({
    action: "theme_share",
    category: "social",
    label: `${platform}_${themeId}`,
  });
};

export const trackLogin = (method = "twitter") => {
  event({
    action: "login",
    category: "auth",
    label: method,
  });
};

export const trackLogout = () => {
  event({
    action: "logout",
    category: "auth",
  });
};

export const trackModalOpen = (modalType: string) => {
  event({
    action: "modal_open",
    category: "ui",
    label: modalType,
  });
};

export const trackModalClose = (modalType: string) => {
  event({
    action: "modal_close",
    category: "ui",
    label: modalType,
  });
};

// OAuth 관련 추적 이벤트들
export const trackOAuthStateValidationFailed = (debugInfo: any) => {
  event({
    action: "oauth_state_validation_failed",
    category: "auth_error",
    label: JSON.stringify({
      isMobile: debugInfo.isMobile,
      userAgent: debugInfo.userAgent?.substring(0, 100), // 길이 제한
      hasSessionStorage: debugInfo.hasSessionStorage,
      timestamp: debugInfo.timestamp,
    }),
  });
};

export const trackOAuthRetry = (retryCount: number, isMobile: boolean) => {
  event({
    action: "oauth_retry",
    category: "auth_error",
    label: `retry_${retryCount}_mobile_${isMobile}`,
    value: retryCount,
  });
};

export const trackOAuthSuccess = (method = "twitter") => {
  event({
    action: "oauth_success",
    category: "auth",
    label: method,
  });
};

export const trackOAuthError = (
  errorType: string,
  errorMessage: string,
  debugInfo?: any
) => {
  event({
    action: "oauth_error",
    category: "auth_error",
    label: JSON.stringify({
      type: errorType,
      message: errorMessage.substring(0, 100), // 길이 제한
      isMobile: debugInfo?.isMobile || false,
    }),
  });
};
