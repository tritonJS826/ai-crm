import {env} from "src/utils/env/env";

export const API_ROUTES = {
  LOGIN: (): string => `${env.API_BASE_PATH}/auth/login/full`,
  LOGOUT: (): string => `${env.API_BASE_PATH}/auth/logout`,
  REFRESH: (): string => `${env.API_BASE_PATH}/auth/refresh`,
  REGISTER: (): string => `${env.API_BASE_PATH}/auth/register`,
  USERS_ME: (): string => `${env.API_BASE_PATH}/users/me`,
} as const;
