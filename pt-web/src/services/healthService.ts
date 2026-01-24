import {env} from "src/utils/env/env";

const DEV_ROUTE_HEALTH = "/br-general/health/";

export class DevApi {

  public static async checkHealth() {
    const data = await fetch(env.API_BASE_PATH + DEV_ROUTE_HEALTH)
      .then(async (response) => response.json());

    // eslint-disable-next-line no-console
    console.log(data);
  }

}

