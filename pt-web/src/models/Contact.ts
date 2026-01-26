import {Platform} from "src/constants/platform";

export type Contact = {
    platform: Platform;
    platformUserId: string;
    phone?: string;
    name?: string;
    optOut: boolean;
}
