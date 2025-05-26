// Google Analytics 설정
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ""

// 페이지뷰 추적
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// 이벤트 추적
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// 커스텀 이벤트들
export const trackThemeSubmit = (themeContent: string) => {
  event({
    action: "theme_submit",
    category: "engagement",
    label: themeContent.substring(0, 50), // 처음 50자만 추적
  })
}

export const trackThemeShare = (themeId: string, platform = "twitter") => {
  event({
    action: "theme_share",
    category: "social",
    label: `${platform}_${themeId}`,
  })
}

export const trackLogin = (method = "twitter") => {
  event({
    action: "login",
    category: "auth",
    label: method,
  })
}

export const trackLogout = () => {
  event({
    action: "logout",
    category: "auth",
  })
}

export const trackModalOpen = (modalType: string) => {
  event({
    action: "modal_open",
    category: "ui",
    label: modalType,
  })
}

export const trackModalClose = (modalType: string) => {
  event({
    action: "modal_close",
    category: "ui",
    label: modalType,
  })
}
