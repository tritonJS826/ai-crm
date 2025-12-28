import {apiClient} from "src/services/apiClient";

export type UserProfile = {
  email: string;
  name: string;
  city: string | null;
  phone: string | null;
  language: string | null;
};

export async function getUserProfile(init?: { signal?: AbortSignal }): Promise<UserProfile> {
  return apiClient.get<UserProfile>("/users/me/profile", init);
}

export async function patchUserProfile(update: Partial<Pick<UserProfile, "city" | "phone" | "language">>): Promise<void> {
  await apiClient.patch<void>("/users/me/profile", update);
}
