import {str} from "envalid";

export const envSchema = {
  API_BASE_PATH: str(),
  ENV_TYPE: str(),
};
