"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  extractAuthCodeFromUrl,
  validateState,
  clearOAuthParams,
  startTwitterLogin,
} from "@/lib/twitter-oauth";
import { trackOAuthRetry } from "@/lib/gtag";

export default function LoginRedirectPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "retrying"
  >("loading");
  const [message, setMessage] = useState("로그인 처리 중...");
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (retryCount >= 2) {
      setMessage(
        "재시도 횟수를 초과했습니다. 메인 페이지에서 다시 로그인해주세요."
      );
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    // 재시도 애널리틱스 추적
    const isMobileDevice =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    trackOAuthRetry(retryCount + 1, isMobileDevice);

    setStatus("retrying");
    setMessage("다시 로그인을 시도합니다...");
    setRetryCount((prev) => prev + 1);

    try {
      clearOAuthParams();
      await startTwitterLogin();
    } catch (error) {
      console.error("재시도 실패:", error);
      setStatus("error");
      setMessage("재시도에 실패했습니다. 메인 페이지에서 다시 시도해주세요.");
      setTimeout(() => router.push("/"), 3000);
    }
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const { code, state, error } = extractAuthCodeFromUrl();

        if (error) {
          throw new Error(`OAuth 오류: ${error}`);
        }

        if (!code) {
          throw new Error("인증 코드가 없습니다.");
        }

        if (!state) {
          throw new Error("State 파라미터가 없습니다.");
        }

        // 개선된 state 검증
        const validation = validateState(state);
        if (!validation.isValid) {
          // 모바일에서의 자동 재시도 로직
          if (validation.shouldRetry && retryCount === 0) {
            setStatus("error");
            setMessage(validation.error || "State 검증 실패");

            // 3초 후 자동 재시도
            setTimeout(() => {
              handleRetry();
            }, 3000);
            return;
          } else {
            throw new Error(
              validation.error || "State 검증 실패. 보안상 로그인을 중단합니다."
            );
          }
        }

        // sessionStorage에서 codeVerifier 가져오기
        const codeVerifier = sessionStorage.getItem("oauth_code_verifier");
        if (!codeVerifier) {
          throw new Error("Code Verifier가 없습니다. PKCE 플로우 오류입니다.");
        }

        console.log("🔐 OAuth 콜백 처리:", {
          code: code.substring(0, 10) + "...",
          codeVerifier: codeVerifier.substring(0, 10) + "...",
          state: state.substring(0, 10) + "...",
        });

        setMessage("백엔드 서버에 로그인 요청 중...");

        // 백엔드로 인증 코드와 codeVerifier 전송 (PKCE 플로우)
        await login(code, codeVerifier);

        setStatus("success");
        setMessage("로그인 성공! 메인 페이지로 이동합니다...");

        // OAuth 파라미터 정리
        clearOAuthParams();

        // 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (error) {
        console.error("로그인 처리 실패:", error);
        setStatus("error");
        const errorMessage =
          error instanceof Error
            ? error.message
            : "로그인 중 오류가 발생했습니다.";
        setMessage(errorMessage);

        // OAuth 파라미터 정리
        clearOAuthParams();

        // 5초 후 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/");
        }, 5000);
      }
    };

    // URL이 로드된 후 콜백 처리
    if (typeof window !== "undefined") {
      handleOAuthCallback();
    }
  }, [login, router, retryCount]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {(status === "loading" || status === "retrying") && (
          <>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e3e3e3",
                borderTop: "4px solid #1da1f2",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </>
        )}

        {status === "success" && (
          <div
            style={{ color: "#28a745", fontSize: "2rem", marginBottom: "1rem" }}
          >
            ✅
          </div>
        )}

        {status === "error" && (
          <div
            style={{ color: "#dc3545", fontSize: "2rem", marginBottom: "1rem" }}
          >
            ❌
          </div>
        )}

        <h2
          style={{
            margin: "0 0 1rem 0",
            color:
              status === "error"
                ? "#dc3545"
                : status === "success"
                ? "#28a745"
                : "#333",
          }}
        >
          {status === "loading"
            ? "로그인 처리 중"
            : status === "retrying"
            ? "다시 시도 중"
            : status === "success"
            ? "로그인 성공"
            : "로그인 실패"}
        </h2>

        <p style={{ margin: "0 0 1rem 0", color: "#666" }}>{message}</p>

        {retryCount > 0 && (
          <p
            style={{ margin: "0 0 1rem 0", color: "#888", fontSize: "0.9rem" }}
          >
            재시도 {retryCount}/2
          </p>
        )}

        {status === "error" && (
          <div
            style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}
          >
            <button
              onClick={handleRetry}
              disabled={retryCount >= 2}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: retryCount >= 2 ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: retryCount >= 2 ? "not-allowed" : "pointer",
              }}
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#1da1f2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              메인으로
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
