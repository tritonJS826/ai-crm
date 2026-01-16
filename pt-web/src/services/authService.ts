import {localStorageWorker, Token as LSToken} from "src/globalServices/localStorageWorker";
import {API_ROUTES} from "src/services/apiRoutes";

export type Role = "ADMIN" | "AGENT";
export type Token = { access_token: string; refresh_token: string; token_type: string };
export type User = { id: string; email: string; name: string; role: Role };
export type UserWithTokens = { user: User; tokens: Token };

export function getAccessToken(): string {
  return localStorageWorker.getItemByKey<LSToken>("accessToken")?.token ?? "";
}
export function getRefreshToken(): string {
  return localStorageWorker.getItemByKey<LSToken>("refreshToken")?.token ?? "";
}
export function saveTokens(tokens: { access_token: string; refresh_token: string }): void {
  localStorageWorker.setItemByKey("accessToken", {token: tokens.access_token});
  localStorageWorker.setItemByKey("refreshToken", {token: tokens.refresh_token});
}
export function clearTokens(): void {
  localStorageWorker.removeItemByKey("accessToken");
  localStorageWorker.removeItemByKey("refreshToken");
}

async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const access = getAccessToken();
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  return fetch(url, {...init, headers});
}

export async function loginByEmail(email: string, password: string): Promise<void> {
  const body = new URLSearchParams({username: email, password});
  const res = await fetch(API_ROUTES.LOGIN(), {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });
  if (!res.ok) {
    throw new Error(`Login request failed: ${res.statusText}`);
  }
  const data = (await res.json()) as UserWithTokens;
  saveTokens({access_token: data.tokens.access_token, refresh_token: data.tokens.refresh_token});
}

export async function registerByEmail(email: string, password: string, fullName: string): Promise<void> {
  const res = await fetch(API_ROUTES.REGISTER(), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email, password, name: fullName, role: "AGENT"}),
  });
  if (!res.ok) {
    throw new Error(`Registration request failed: ${res.statusText}`);
  }
  const data = (await res.json()) as UserWithTokens;
  saveTokens({access_token: data.tokens.access_token, refresh_token: data.tokens.refresh_token});
}

export async function refreshTokens(): Promise<void> {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("Refresh token not found");
  }

  const res = await fetch(API_ROUTES.REFRESH(), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({access_token: access, refresh_token: refresh}),
  });
  if (!res.ok) {
    throw new Error(`Refresh request failed: ${res.statusText}`);
  }

  const data = (await res.json()) as UserWithTokens;
  saveTokens({access_token: data.tokens.access_token, refresh_token: data.tokens.refresh_token});
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await apiFetch(API_ROUTES.USERS_ME());
  const data = (await res.json()) as User;

  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(API_ROUTES.LOGOUT(), {method: "POST"});
  } finally {
    clearTokens();
  }
}
