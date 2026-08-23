const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(API_URL + path, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || "Request failed");
  }

  return json.data as T;
}
