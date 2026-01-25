import {localStorageWorker, Token as LSToken} from "src/globalServices/localStorageWorker";
import {refreshTokens} from "src/services/authService";
import {env} from "src/utils/env/env";

const DEFAULT_TIMEOUT_MS = 10_000;

const HTTP_STATUS = {
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  UNAUTHORIZED: 401,
} as const;

const HEADER = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
} as const;

const MIME = {JSON: "application/json"} as const;
export interface ApiError extends Error {
  status?: number;
}

class ApiClient {

  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  constructor(baseUrl: string, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  public get<T>(url: string, init?: RequestInit & { signal?: AbortSignal }): Promise<T> {
    return this.request<T>("GET", url, undefined, init);
  }

  public post<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>("POST", url, body, init);
  }

  public put<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>("PUT", url, body, init);
  }

  public patch<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>("PATCH", url, body, init);
  }

  public delete<T>(url: string, init?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", url, undefined, init);
  }

  public async request<T>(
    method: string,
    url: string,
    body?: unknown,
    init?: RequestInit,
    retryOnUnauthorized: boolean = true,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers = this.buildHeaders(init, body);
      const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

      const response = await fetch(`${this.baseUrl}${url}`, {
        method,
        headers,
        body:
          body === undefined
            ? undefined
            : isFormData
              ? (body as BodyInit)
              : JSON.stringify(body),
        signal: controller.signal,
        ...init,
      });

      if (response.status === HTTP_STATUS.UNAUTHORIZED && retryOnUnauthorized) {
        try {
          await refreshTokens();
          const retryHeaders = this.buildHeaders(init, body);
          const retryResponse = await fetch(`${this.baseUrl}${url}`, {
            method,
            headers: retryHeaders,
            body:
              body === undefined
                ? undefined
                : isFormData
                  ? (body as BodyInit)
                  : JSON.stringify(body),
            signal: controller.signal,
            ...init,
          });

          await this.ensureOkOrThrow(retryResponse);

          return this.parseJsonSafe<T>(retryResponse);
        } catch {
          await this.ensureOkOrThrow(response);
        }
      }

      await this.ensureOkOrThrow(response);

      return this.parseJsonSafe<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const accessObj = localStorageWorker.getItemByKey<LSToken>("accessToken");

    const headers: Record<string, string> = {};
    if (accessObj?.token) {
      headers[HEADER.AUTHORIZATION] = `Bearer ${accessObj.token}`;
    }

    return headers;
  }

  private buildHeaders(init?: RequestInit, body?: unknown): Headers {
    const headers = new Headers(init?.headers || {});
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    Object.entries(this.getAuthHeaders()).forEach(([key, value]) => {
      headers.set(key, value);
    });

    if (body !== undefined && !isFormData && !headers.has(HEADER.CONTENT_TYPE)) {
      headers.set(HEADER.CONTENT_TYPE, MIME.JSON);
    }

    return headers;
  }

  private async parseJsonSafe<T>(res: Response): Promise<T> {
    if (res.status === HTTP_STATUS.NO_CONTENT || res.status === HTTP_STATUS.RESET_CONTENT) {
      return undefined as unknown as T;
    }

    const text = await res.text();
    if (!text) {
      return undefined as unknown as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private async ensureOkOrThrow(res: Response): Promise<void> {
    if (res.ok) {
      return;
    }

    let message = `HTTP ${res.status} ${res.statusText}`;

    try {
      const data = await this.parseJsonSafe<unknown>(res.clone());
      if (typeof data === "string" && data.trim().length > 0) {
        message = data;
      } else if (data && typeof data === "object" && "detail" in data) {
        const detail = (data as { detail?: string }).detail;
        if (detail && detail.trim().length > 0) {
          message = detail;
        }
      }
    } catch {
      // Ignore
    }

    const error: ApiError = new Error(message);
    error.status = res.status;
    throw error;
  }

}

export const apiClient = new ApiClient(env.API_BASE_PATH);
