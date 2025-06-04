"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/types/user";
import {
  getEvents,
  getAdminThemes,
  createEvent,
  updateEvent,
  deleteEvent,
  updateThemeStatus,
  hideTheme,
  unhideTheme,
} from "@/lib/theme-api";
import type {
  EventResponse,
  ThemeResponse,
  PagedResponse,
  CreateEventRequest,
} from "@/lib/theme-api";

export default function AdminPage() {
  const { user, isLoggedIn, initializeAuth, isLoading } = useAuthStore();
  const router = useRouter();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"events" | "themes">("events");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null);

  // 이벤트 생성 폼 상태
  const [eventForm, setEventForm] = useState<CreateEventRequest>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    maxThemes: 100,
    isPublic: true,
  });

  // 인증 초기화
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 관리자 권한 확인
  useEffect(() => {
    if (!isLoading && isLoggedIn && !isAdmin(user)) {
      alert("관리자 권한이 필요합니다.");
      router.push("/");
    }
  }, [isLoggedIn, isLoading, user, router]);

  // 데이터 로드
  useEffect(() => {
    if (isLoggedIn && isAdmin(user)) {
      loadData();
    }
  }, [isLoggedIn, user, activeTab]);

  // 빠른 이벤트 생성 데이터 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const quickCreateData = sessionStorage.getItem("quickCreateEvent");
      if (quickCreateData) {
        try {
          const eventData = JSON.parse(quickCreateData);

          // LocalDateTime 형식의 날짜를 input[type="date"]에 맞게 변환
          const processedData = {
            ...eventData,
            startDate: eventData.startDate.includes("T")
              ? eventData.startDate.split("T")[0]
              : eventData.startDate,
            endDate: eventData.endDate.includes("T")
              ? eventData.endDate.split("T")[0]
              : eventData.endDate,
          };

          setEventForm(processedData);
          setShowCreateEventForm(true);
          setActiveTab("events");

          // 세션스토리지에서 제거
          sessionStorage.removeItem("quickCreateEvent");

          alert(
            "빠른 이벤트 생성 데이터가 로드되었습니다. 내용을 확인하고 생성 버튼을 눌러주세요."
          );
        } catch (error) {
          console.error("Failed to parse quick create data:", error);
        }
      }
    }
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      if (activeTab === "events") {
        const eventData = await getEvents(0, 50);
        setEvents(eventData.content);
      } else {
        const themeData = await getAdminThemes(0, 50, undefined, true);
        setThemes(themeData.content);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // 이벤트 생성 처리
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!eventForm.title.trim()) {
      alert("이벤트 제목을 입력해주세요.");
      return;
    }

    if (!eventForm.description.trim()) {
      alert("이벤트 설명을 입력해주세요.");
      return;
    }

    if (!eventForm.startDate || !eventForm.endDate) {
      alert("시작일과 종료일을 입력해주세요.");
      return;
    }

    if (new Date(eventForm.startDate) >= new Date(eventForm.endDate)) {
      alert("종료일은 시작일보다 나중이어야 합니다.");
      return;
    }

    try {
      // 날짜에 시간 추가 (LocalDateTime 형식으로 변환)
      const eventData = {
        ...eventForm,
        startDate: eventForm.startDate + "T00:00:00", // 시작일은 00:00:00
        endDate: eventForm.endDate + "T23:59:59", // 종료일은 23:59:59
      };

      await createEvent(eventData);
      alert("이벤트가 성공적으로 생성되었습니다!");

      // 폼 초기화
      setEventForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        maxThemes: 100,
        isPublic: true,
      });

      setShowCreateEventForm(false);
      await loadData(); // 목록 새로고침
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("이벤트 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 이벤트 수정 시작
  const handleEditEvent = (event: EventResponse) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      // LocalDateTime 형식에서 날짜 부분만 추출 (YYYY-MM-DD)
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate.split("T")[0],
      maxThemes: event.maxThemes,
      isPublic: event.isPublic,
    });
    setShowCreateEventForm(true);
  };

  // 이벤트 수정 처리
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEvent) return;

    // 유효성 검사
    if (!eventForm.title.trim()) {
      alert("이벤트 제목을 입력해주세요.");
      return;
    }

    if (!eventForm.description.trim()) {
      alert("이벤트 설명을 입력해주세요.");
      return;
    }

    if (!eventForm.startDate || !eventForm.endDate) {
      alert("시작일과 종료일을 입력해주세요.");
      return;
    }

    if (new Date(eventForm.startDate) >= new Date(eventForm.endDate)) {
      alert("종료일은 시작일보다 나중이어야 합니다.");
      return;
    }

    try {
      // 날짜에 시간 추가 (LocalDateTime 형식으로 변환)
      const eventData = {
        ...eventForm,
        startDate: eventForm.startDate + "T00:00:00", // 시작일은 00:00:00
        endDate: eventForm.endDate + "T23:59:59", // 종료일은 23:59:59
      };

      await updateEvent(editingEvent.id, eventData);
      alert("이벤트가 성공적으로 수정되었습니다!");

      // 폼 초기화
      setEventForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        maxThemes: 100,
        isPublic: true,
      });

      setEditingEvent(null);
      setShowCreateEventForm(false);
      await loadData(); // 목록 새로고침
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("이벤트 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 이벤트 삭제 처리
  const handleDeleteEvent = async (eventId: number, eventTitle: string) => {
    const confirmMessage = `"${eventTitle}" 이벤트를 정말 삭제하시겠습니까?\n\n⚠️ 주의: 이 작업은 되돌릴 수 없으며, 해당 이벤트의 모든 테마도 함께 삭제됩니다.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteEvent(eventId);
      alert("이벤트가 성공적으로 삭제되었습니다.");
      await loadData(); // 목록 새로고침
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("이벤트 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 폼 취소 처리
  const handleCancelForm = () => {
    setShowCreateEventForm(false);
    setEditingEvent(null);
    setEventForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      maxThemes: 100,
      isPublic: true,
    });
  };

  // 폼 필드 업데이트
  const updateEventForm = (field: keyof CreateEventRequest, value: any) => {
    setEventForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 현재 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleThemeStatusChange = async (
    themeId: number,
    newStatus: string
  ) => {
    try {
      await updateThemeStatus(themeId, newStatus);
      await loadData(); // 목록 새로고침
      alert(`테마 상태가 "${newStatus}"로 변경되었습니다.`);
    } catch (error) {
      console.error("Failed to update theme status:", error);
      alert("테마 상태 변경에 실패했습니다.");
    }
  };

  const handleHideTheme = async (themeId: number) => {
    const reason = prompt("숨김 사유를 입력하세요 (선택사항):");
    try {
      await hideTheme(themeId, reason || undefined);
      await loadData();
      alert("테마가 숨겨졌습니다.");
    } catch (error) {
      console.error("Failed to hide theme:", error);
      alert("테마 숨김에 실패했습니다.");
    }
  };

  const handleUnhideTheme = async (themeId: number) => {
    try {
      await unhideTheme(themeId);
      await loadData();
      alert("테마 숨김이 해제되었습니다.");
    } catch (error) {
      console.error("Failed to unhide theme:", error);
      alert("테마 숨김 해제에 실패했습니다.");
    }
  };

  // 로딩 중이거나 권한이 없는 경우
  if (isLoading || !isLoggedIn || !isAdmin(user)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>🔧 관리자 패널</h1>
        <p style={{ color: "#666" }}>이벤트 및 테마를 관리할 수 있습니다.</p>

        <button
          onClick={() => router.push("/")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          ← 메인 페이지로 돌아가기
        </button>
      </header>

      {/* 탭 메뉴 */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", borderBottom: "2px solid #dee2e6" }}>
          <button
            onClick={() => setActiveTab("events")}
            style={{
              padding: "1rem 2rem",
              backgroundColor:
                activeTab === "events" ? "#007bff" : "transparent",
              color: activeTab === "events" ? "white" : "#007bff",
              border: "none",
              borderBottom:
                activeTab === "events" ? "2px solid #007bff" : "none",
              cursor: "pointer",
            }}
          >
            📅 이벤트 관리
          </button>
          <button
            onClick={() => setActiveTab("themes")}
            style={{
              padding: "1rem 2rem",
              backgroundColor:
                activeTab === "themes" ? "#007bff" : "transparent",
              color: activeTab === "themes" ? "white" : "#007bff",
              border: "none",
              borderBottom:
                activeTab === "themes" ? "2px solid #007bff" : "none",
              cursor: "pointer",
            }}
          >
            📝 테마 관리
          </button>
        </div>
      </div>

      {/* 이벤트 관리 탭 */}
      {activeTab === "events" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2>📅 이벤트 목록</h2>
            <button
              onClick={() => setShowCreateEventForm(!showCreateEventForm)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: showCreateEventForm ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {showCreateEventForm
                ? "❌ 취소"
                : editingEvent
                ? "+ 새 이벤트 생성"
                : "+ 새 이벤트 생성"}
            </button>
          </div>

          {/* 이벤트 생성 폼 */}
          {showCreateEventForm && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "2rem",
                marginBottom: "2rem",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0", color: "#495057" }}>
                {editingEvent ? "✏️ 이벤트 수정" : "🆕 새 이벤트 생성"}
              </h3>

              <form
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
              >
                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  {/* 제목 */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      이벤트 제목 *
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => updateEventForm("title", e.target.value)}
                      placeholder="예: 부야부야 3주년 기념 테마 신청"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "1rem",
                      }}
                      required
                    />
                  </div>

                  {/* 설명 */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      이벤트 설명 *
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) =>
                        updateEventForm("description", e.target.value)
                      }
                      placeholder="이벤트에 대한 상세 설명을 입력하세요..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "1rem",
                        resize: "vertical",
                      }}
                      required
                    />
                  </div>

                  {/* 시작일 */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      시작일 *
                    </label>
                    <input
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) =>
                        updateEventForm("startDate", e.target.value)
                      }
                      min={getTodayString()}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "1rem",
                      }}
                      required
                    />
                  </div>

                  {/* 종료일 */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      종료일 *
                    </label>
                    <input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) =>
                        updateEventForm("endDate", e.target.value)
                      }
                      min={eventForm.startDate || getTodayString()}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "1rem",
                      }}
                      required
                    />
                  </div>

                  {/* 최대 테마 수 */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      최대 테마 수
                    </label>
                    <input
                      type="number"
                      value={eventForm.maxThemes}
                      onChange={(e) =>
                        updateEventForm(
                          "maxThemes",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="1"
                      max="1000"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  {/* 공개 여부 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={eventForm.isPublic}
                      onChange={(e) =>
                        updateEventForm("isPublic", e.target.checked)
                      }
                      style={{ transform: "scale(1.2)" }}
                    />
                    <label htmlFor="isPublic" style={{ fontWeight: "bold" }}>
                      공개 이벤트
                    </label>
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                >
                  <button
                    type="submit"
                    style={{
                      padding: "0.75rem 2rem",
                      backgroundColor: editingEvent ? "#ffc107" : "#28a745",
                      color: editingEvent ? "#212529" : "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "bold",
                    }}
                  >
                    {editingEvent ? "✏️ 이벤트 수정" : "✅ 이벤트 생성"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    style={{
                      padding: "0.75rem 2rem",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 이벤트 목록 */}
          {isLoadingData ? (
            <p>로딩 중...</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "1.5rem",
                    backgroundColor: event.isActive ? "#d4edda" : "#f8f9fa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 0.5rem 0" }}>
                        {event.title}
                        {event.isActive && (
                          <span
                            style={{
                              marginLeft: "10px",
                              padding: "2px 8px",
                              backgroundColor: "#28a745",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                            }}
                          >
                            활성
                          </span>
                        )}
                      </h3>
                      <p style={{ margin: "0 0 1rem 0", color: "#666" }}>
                        {event.description}
                      </p>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        <p>
                          📅 {event.startDate} ~ {event.endDate}
                        </p>
                        <p>
                          📝 현재 테마 수: {event.currentThemeCount} /{" "}
                          {event.maxThemes || "제한없음"}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleEditEvent(event)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#ffc107",
                          color: "#212529",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 테마 관리 탭 */}
      {activeTab === "themes" && (
        <div>
          <h2>📝 테마 관리</h2>

          {isLoadingData ? (
            <p>로딩 중...</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "1.5rem",
                    backgroundColor: theme.isHidden ? "#f8d7da" : "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.5rem 0" }}>
                        {theme.title}
                        <span
                          style={{
                            marginLeft: "10px",
                            padding: "2px 8px",
                            backgroundColor:
                              theme.status === "APPROVED"
                                ? "#28a745"
                                : theme.status === "REJECTED"
                                ? "#dc3545"
                                : "#ffc107",
                            color: "white",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {theme.status}
                        </span>
                        {theme.isHidden && (
                          <span
                            style={{
                              marginLeft: "5px",
                              padding: "2px 8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                            }}
                          >
                            숨김
                          </span>
                        )}
                      </h4>
                      <p style={{ margin: "0 0 1rem 0" }}>{theme.content}</p>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        <p>
                          👤 작성자: {theme.authorName} (@{theme.authorUsername}
                          )
                        </p>
                        <p>
                          📅 작성일:{" "}
                          {new Date(theme.createdAt).toLocaleString("ko-KR")}
                        </p>
                        <p>👀 조회수: {theme.viewCount}</p>
                        {theme.hiddenReason && (
                          <p style={{ color: "#dc3545" }}>
                            🚫 숨김 사유: {theme.hiddenReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {/* 상태 변경 버튼들 */}
                      <select
                        value={theme.status}
                        onChange={(e) =>
                          handleThemeStatusChange(theme.id, e.target.value)
                        }
                        style={{
                          padding: "0.25rem",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="PENDING">대기중</option>
                        <option value="APPROVED">승인</option>
                        <option value="REJECTED">거부</option>
                      </select>

                      {/* 숨김/숨김해제 버튼 */}
                      {theme.isHidden ? (
                        <button
                          onClick={() => handleUnhideTheme(theme.id)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          숨김 해제
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHideTheme(theme.id)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          숨기기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
