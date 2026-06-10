const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://flowframe-backend-bwgq.onrender.com";

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
