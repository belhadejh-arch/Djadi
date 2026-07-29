// Thin fetch wrapper for admin API calls
// All admin endpoints are under /api/admin/

const BASE = "/api/admin";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  // Users
  users: {
    list: (params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        "GET", `/users?${q}`
      );
    },
    stats: () => request<any>("GET", "/users/stats"),
    get: (id: number) => request<any>("GET", `/users/${id}`),
    create: (body: any) => request<any>("POST", "/users", body),
    update: (id: number, body: any) => request<any>("PATCH", `/users/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/users/${id}`),
    activate: (id: number) => request<any>("POST", `/users/${id}/activate`),
    deactivate: (id: number) => request<any>("POST", `/users/${id}/deactivate`),
  },
  // Levels
  levels: {
    list: () => request<any[]>("GET", "/levels"),
    get: (id: number) => request<any>("GET", `/levels/${id}`),
    create: (body: any) => request<any>("POST", "/levels", body),
    update: (id: number, body: any) => request<any>("PATCH", `/levels/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/levels/${id}`),
  },
  // Branches
  branches: {
    list: () => request<any[]>("GET", "/branches"),
    get: (id: number) => request<any>("GET", `/branches/${id}`),
    create: (body: any) => request<any>("POST", "/branches", body),
    update: (id: number, body: any) => request<any>("PATCH", `/branches/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/branches/${id}`),
  },
  // Subjects
  subjects: {
    list: () => request<any[]>("GET", "/subjects"),
    get: (id: number) => request<any>("GET", `/subjects/${id}`),
    create: (body: any) => request<any>("POST", "/subjects", body),
    update: (id: number, body: any) => request<any>("PATCH", `/subjects/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/subjects/${id}`),
  },
  // Lessons
  lessons: {
    list: (subjectId?: number) =>
      request<any[]>("GET", subjectId ? `/lessons?subjectId=${subjectId}` : "/lessons"),
    get: (id: number) => request<any>("GET", `/lessons/${id}`),
    create: (body: any) => request<any>("POST", "/lessons", body),
    update: (id: number, body: any) => request<any>("PATCH", `/lessons/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/lessons/${id}`),
  },
  // Exams
  exams: {
    list: () => request<any[]>("GET", "/exams"),
    get: (id: number) => request<any>("GET", `/exams/${id}`),
    create: (body: any) => request<any>("POST", "/exams", body),
    update: (id: number, body: any) => request<any>("PATCH", `/exams/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/exams/${id}`),
  },
  // Tests
  tests: {
    list: () => request<any[]>("GET", "/tests"),
    get: (id: number) => request<any>("GET", `/tests/${id}`),
    create: (body: any) => request<any>("POST", "/tests", body),
    update: (id: number, body: any) => request<any>("PATCH", `/tests/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/tests/${id}`),
  },
  // Baccalaureate Papers
  baccalaureates: {
    list: () => request<any[]>("GET", "/baccalaureates"),
    get: (id: number) => request<any>("GET", `/baccalaureates/${id}`),
    create: (body: any) => request<any>("POST", "/baccalaureates", body),
    update: (id: number, body: any) => request<any>("PATCH", `/baccalaureates/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/baccalaureates/${id}`),
  },
  // Review Channels
  reviewChannels: {
    list: () => request<any[]>("GET", "/review-channels"),
    get: (id: number) => request<any>("GET", `/review-channels/${id}`),
    create: (body: any) => request<any>("POST", "/review-channels", body),
    update: (id: number, body: any) => request<any>("PATCH", `/review-channels/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/review-channels/${id}`),
    addVideo: (channelId: number, body: any) =>
      request<any>("POST", `/review-channels/${channelId}/videos`, body),
    updateVideo: (channelId: number, videoId: number, body: any) =>
      request<any>("PATCH", `/review-channels/${channelId}/videos/${videoId}`, body),
    deleteVideo: (channelId: number, videoId: number) =>
      request<any>("DELETE", `/review-channels/${channelId}/videos/${videoId}`),
  },
  // Announcements
  announcements: {
    list: () => request<any[]>("GET", "/announcements"),
    get: (id: number) => request<any>("GET", `/announcements/${id}`),
    create: (body: any) => request<any>("POST", "/announcements", body),
    update: (id: number, body: any) => request<any>("PATCH", `/announcements/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/announcements/${id}`),
  },
  // Notifications
  notifications: {
    list: () => request<any[]>("GET", "/notifications"),
    send: (body: any) => request<any>("POST", "/notifications/send", body),
    delete: (id: number) => request<any>("DELETE", `/notifications/${id}`),
  },
  // Language Settings
  languageSettings: {
    list: (langCode?: string) =>
      request<any[]>("GET", langCode ? `/language-settings?langCode=${langCode}` : "/language-settings"),
    get: (id: number) => request<any>("GET", `/language-settings/${id}`),
    create: (body: any) => request<any>("POST", "/language-settings", body),
    update: (id: number, body: any) => request<any>("PATCH", `/language-settings/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/language-settings/${id}`),
  },
  // Homework
  homework: {
    list: () => request<any[]>("GET", "/homework"),
    get: (id: number) => request<any>("GET", `/homework/${id}`),
    create: (body: any) => request<any>("POST", "/homework", body),
    update: (id: number, body: any) => request<any>("PATCH", `/homework/${id}`, body),
    delete: (id: number) => request<any>("DELETE", `/homework/${id}`),
  },
  // Dashboard
  dashboard: {
    stats: () => request<any>("GET", "/dashboard/stats"),
  },
  // Audit Logs
  auditLogs: {
    list: (params?: { page?: number; limit?: number; action?: string; entity?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.action) q.set("action", params.action);
      if (params?.entity) q.set("entity", params.entity);
      return request<{ data: any[]; total: number; page: number; limit: number }>("GET", `/audit-logs?${q}`);
    },
  },
  // Backup
  backup: {
    list: () => request<any[]>("GET", "/backup"),
    create: () => request<any>("POST", "/backup/create"),
    restore: (payload: any) => request<any>("POST", "/backup/restore", payload),
    delete: (id: string) => request<any>("DELETE", `/backup/${id}`),
    downloadUrl: (id: string) => `${BASE_URL}${BASE}/backup/${id}/download`,
  },
};
