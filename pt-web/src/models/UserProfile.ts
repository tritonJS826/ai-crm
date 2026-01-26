export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "AGENT";
  createdAt: string;
};
