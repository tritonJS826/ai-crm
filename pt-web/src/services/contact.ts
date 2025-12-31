import {Platform} from "src/constants/platform";

// Base schema for contact data.
export type ContactBase = {
    platform: Platform;
    platform_user_id: string;
    phone?: string;
    name?: string;
}

// Schema for creating a new contact.
export type ContactCreate = ContactBase

// Schema for contact data in responses.
export type ContactOut = ContactBase & {
    id: string;
    opt_out: boolean;
    created_at: Date;
    updated_at: Date;
}

// Schema for updating contact opt-out status
export type ContactOptOutUpdate = {
    opt_out: boolean;
}
