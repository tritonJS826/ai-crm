import {Platform} from "src/constants/platform";

// Base schema for contact data.
export type ContactBase = {
    platform: Platform;
    platformUserId: string;
    phone?: string;
    name?: string;
}

// Schema for creating a new contact.
export type ContactCreate = ContactBase

// Schema for contact data in responses.
export type ContactOut = ContactBase & {
    id: string;
    optOut: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Schema for updating contact opt-out status
export type ContactOptOutUpdate = {
    optOut: boolean;
}
