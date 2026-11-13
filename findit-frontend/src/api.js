const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// The server address without "/api", where the photos are served
const ORIGIN = BASE.replace(/\/api\/?$/, "");

// Turns a saved file name into a full picture address
export function imageUrl(fileName) {
  return fileName ? `${ORIGIN}/uploads/${fileName}` : null;
}

// One function for every request to the server.
// It adds the login token automatically and turns errors into messages.
export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("findit_token");
  const isForm = body instanceof FormData;

  const headers = {};
  // For a form with a file, the browser sets the content type itself
  if (body && !isForm) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
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