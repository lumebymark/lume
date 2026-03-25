// frontend/src/lib/admin-api.ts

const TOKEN_KEY = "lume_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
export function isAuthenticated(): boolean {
  return !!getToken();
}

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api/admin${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }
  return res;
}

export async function login(password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function verifyAuth() {
  const res = await adminFetch("/me");
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function getStats() {
  const res = await adminFetch("/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export interface ListingsQuery {
  status?: string;
  internal_status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getListings(params: ListingsQuery = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.internal_status) query.set("internal_status", params.internal_status);
  if (params.search) query.set("search", params.search);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  const res = await adminFetch(`/listings${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function getListing(id: string) {
  const res = await adminFetch(`/listings/${id}`);
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}

export async function createListing(data: Record<string, unknown>) {
  const res = await adminFetch("/listings", { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create listing");
  }
  return res.json();
}

export async function updateListing(id: string, data: Record<string, unknown>) {
  const res = await adminFetch(`/listings/${id}`, { method: "PUT", body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update listing");
  }
  return res.json();
}

export async function deleteListing(id: string) {
  const res = await adminFetch(`/listings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete listing");
  return res.json();
}

export interface ContactsQuery {
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getContacts(params: ContactsQuery = {}) {
  const query = new URLSearchParams();
  if (params.source) query.set("source", params.source);
  if (params.search) query.set("search", params.search);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  const res = await adminFetch(`/contacts${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export async function deleteContact(id: string) {
  const res = await adminFetch(`/contacts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete contact");
  return res.json();
}
