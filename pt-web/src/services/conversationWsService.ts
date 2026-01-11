import {MessageDirection} from "src/constants/messageDirection";
import {Platform} from "src/constants/platform";

// Schema for new_message data in incoming ws event.
export type NewMessage = {
    conversation_id: string;
    message_id: string;
    direction: MessageDirection;
    from_user_id?: string;
    platform: Platform;
    text?: string;
}
