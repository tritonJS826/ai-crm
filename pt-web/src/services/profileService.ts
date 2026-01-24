import {apiClient} from "src/services/apiClient";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "AGENT";
  createdAt: string;
};

export async function getUserProfile(init?: { signal?: AbortSignal }): Promise<UserProfile> {
  return apiClient.get<UserProfile>("/br-general/users/me", init);
}

export async function patchUserProfile(update: Partial<Pick<UserProfile, "name" | "email">>): Promise<void> {
  await apiClient.patch<void>("/br-general/users/me", update);
}
