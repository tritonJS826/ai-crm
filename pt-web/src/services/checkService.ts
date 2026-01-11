import {apiClient} from "src/services/apiClient";

export async function ping<T>(payload: T): Promise<string> {
  return apiClient.post<string>("/check/ping", payload);
}

export async function inboundMessage<T>(payload: T): Promise<string> {
  return apiClient.post<string>("/check/inbound-message", payload);
}

export async function broadcast<T>(payload: T): Promise<string> {
  return apiClient.post<string>("/check/broadcast", payload);
}
