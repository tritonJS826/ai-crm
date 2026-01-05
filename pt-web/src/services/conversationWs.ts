import {Platform} from "src/constants/platform";

// Schema for new_message data in incoming ws event.
export type NewMessage = {
    conversation_id: string;
    message_id: string;
    from_user_id?: string;
    platform: Platform;
    text?: string;
}
