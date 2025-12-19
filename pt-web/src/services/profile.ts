import {apiClient} from "src/services/apiClient";

export type UserProfile = {
  email: string;
  name: string;
  city: string | null;
  phone: string | null;
  language: string | null;
};

export type UserPersonal = {
  plan: "FREE" | "BASIC" | string;
  consultations_used: number;
  consultations_included: number;
  days_to_end: number;
  test_topics: Array<{ id: string; title: string }>;
};

export type TestSession = {
  session_id: string;
  created_at: string;
  finished_at: string | null;
  answers: Array<{
    question_id: string;
    question_text: string;
    answer: string;
  }>;
};

export type UserTestResults = {
  test_id: string;
  title: string;
  description: string | null;
  sessions: TestSession[];
};

export async function getUserProfile(init?: { signal?: AbortSignal }): Promise<UserProfile> {
  return apiClient.get<UserProfile>("/users/me/profile", init);
}

export async function patchUserProfile(update: Partial<Pick<UserProfile, "city" | "phone" | "language">>): Promise<void> {
  await apiClient.patch<void>("/users/me/profile", update);
}

export async function getUserPersonal(init?: RequestInit & { signal?: AbortSignal }): Promise<UserPersonal> {
  return apiClient.get<UserPersonal>("/users/me/personal", init);
}

export async function getUserTestResults(testId: string): Promise<UserTestResults> {
  return apiClient.get<UserTestResults>(`/users/me/tests/${encodeURIComponent(testId)}`);
}
