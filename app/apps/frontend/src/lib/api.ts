import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  withCredentials: true,
});

// JSON by default; FormData must omit Content-Type so the browser sets multipart boundary
api.interceptors.request.use((config) => {
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
  const headers = config.headers;

  if (isFormData) {
    if (headers && typeof headers.delete === "function") {
      headers.delete("Content-Type");
      headers.delete("content-type");
    } else if (headers) {
      delete (headers as Record<string, unknown>)["Content-Type"];
      delete (headers as Record<string, unknown>)["content-type"];
    }
  } else if (headers) {
    const hasType =
      (typeof headers.get === "function" && headers.get("Content-Type")) ||
      (headers as Record<string, unknown>)["Content-Type"];
    if (!hasType) {
      if (typeof headers.set === "function") {
        headers.set("Content-Type", "application/json");
      } else {
        (headers as Record<string, unknown>)["Content-Type"] = "application/json";
      }
    }
  }

  return config;
});

// ── Response interceptor: auto-refresh on 401 ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Routes publiques — ne jamais rediriger automatiquement
    const publicRoutes = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/me"];

    const isPublicRoute = publicRoutes.some((route) => originalRequest.url?.includes(route));

    // Si 401 sur route publique → laisser l'erreur remonter normalement
    if (isPublicRoute) {
      return Promise.reject(error);
    }

    // Si 401 sur route protégée et pas déjà en train de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenter le refresh
        await api.post("/auth/refresh");
        // Retry la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh échoué → rediriger SEULEMENT si pas sur page publique
        const currentPath = window.location.pathname;
        const isOnPublicPage = ["/login", "/signup", "/forgot-password"].includes(currentPath);

        if (!isOnPublicPage) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** Paths returned by the API (e.g. /api/user/avatar-stream) — same-origin via Vite proxy in dev */
export function resolveApiPath(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/api")) return path;
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export default api;
