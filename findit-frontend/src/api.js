const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// One function for every request to the server.
// It adds the login token automatically and turns errors into messages.
export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("findit_token");

  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is it running?");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = res.status;
    throw error;
  }
  return data;
}