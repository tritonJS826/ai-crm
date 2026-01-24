/* tslint:disable */
/* eslint-disable */
/**
 * Schema for updating contact opt-out status.
 * @export
 * @interface ContactOptOutUpdate
 */
export interface ContactOptOutUpdate {
    /**
     * 
     * @type {boolean}
     * @memberof ContactOptOutUpdate
     */
    optOut: boolean;
}
/**
 * Schema for contact data in responses.
 * @export
 * @interface ContactOut
 */
export interface ContactOut {
    /**
     * 
     * @type {Platform}
     * @memberof ContactOut
     */
    platform: Platform;
    /**
     * 
     * @type {string}
     * @memberof ContactOut
     */
    platformUserId: string;
    /**
     * 
     * @type {string}
     * @memberof ContactOut
     */
    phone?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContactOut
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContactOut
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof ContactOut
     */
    optOut?: boolean;
    /**
     * 
     * @type {string}
     * @memberof ContactOut
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof ContactOut
     */
    updatedAt: string;
}


/**
 * Schema for paginated conversation list.
 * @export
 * @interface ConversationListResponse
 */
export interface ConversationListResponse {
    /**
     * 
     * @type {Array<ConversationWithContact>}
     * @memberof ConversationListResponse
     */
    items: Array<ConversationWithContact>;
    /**
     * 
     * @type {number}
     * @memberof ConversationListResponse
     */
    total: number;
    /**
     * 
     * @type {number}
     * @memberof ConversationListResponse
     */
    limit: number;
    /**
     * 
     * @type {number}
     * @memberof ConversationListResponse
     */
    offset: number;
}

/**
 * Conversation status options.
 * @export
 */
export const ConversationStatus = {
    Open: 'OPEN',
    Closed: 'CLOSED'
} as const;
export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus];

/**
 * Schema for conversation with nested contact data.
 * @export
 * @interface ConversationWithContact
 */
export interface ConversationWithContact {
    /**
     * 
     * @type {string}
     * @memberof ConversationWithContact
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ConversationWithContact
     */
    contactId: string;
    /**
     * 
     * @type {ConversationStatus}
     * @memberof ConversationWithContact
     */
    status: ConversationStatus;
    /**
     * 
     * @type {string}
     * @memberof ConversationWithContact
     */
    lastMessageAt: string;
    /**
     * 
     * @type {string}
     * @memberof ConversationWithContact
     */
    createdAt: string;
    /**
     * 
     * @type {ContactOut}
     * @memberof ConversationWithContact
     */
    contact: ContactOut;
}


/**
 * 
 * @export
 * @interface EmailSendRequest
 */
export interface EmailSendRequest {
    /**
     * 
     * @type {string}
     * @memberof EmailSendRequest
     */
    to: string;
    /**
     * 
     * @type {string}
     * @memberof EmailSendRequest
     */
    subject: string;
    /**
     * 
     * @type {string}
     * @memberof EmailSendRequest
     */
    text?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EmailSendRequest
     */
    html?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EmailSendRequest
     */
    template?: string | null;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof EmailSendRequest
     */
    params?: { [key: string]: any; };
}
/**
 * 
 * @export
 * @interface EmailSendResponse
 */
export interface EmailSendResponse {
    /**
     * 
     * @type {boolean}
     * @memberof EmailSendResponse
     */
    accepted: boolean;
    /**
     * 
     * @type {string}
     * @memberof EmailSendResponse
     */
    message?: string;
}
/**
 * 
 * @export
 * @interface HTTPValidationError
 */
export interface HTTPValidationError {
    /**
     * 
     * @type {Array<ValidationError>}
     * @memberof HTTPValidationError
     */
    detail?: Array<ValidationError>;
}
/**
 * 
 * @export
 * @interface LocationInner
 */
export interface LocationInner {
}
/**
 * Schema for logout response.
 * @export
 * @interface LogoutResponse
 */
export interface LogoutResponse {
    /**
     * 
     * @type {string}
     * @memberof LogoutResponse
     */
    message: string;
}
/**
 * 
 * @export
 * @interface MessageOut
 */
export interface MessageOut {
    /**
     * 
     * @type {string}
     * @memberof MessageOut
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof MessageOut
     */
    conversationId: string;
    /**
     * 
     * @type {string}
     * @memberof MessageOut
     */
    fromUserId?: string | null;
    /**
     * 
     * @type {Platform}
     * @memberof MessageOut
     */
    platform: Platform;
    /**
     * 
     * @type {string}
     * @memberof MessageOut
     */
    text?: string | null;
    /**
     * 
     * @type {string}
     * @memberof MessageOut
     */
    mediaUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof MessageOut
     */
    remoteMessageId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof MessageOut
     */
    createdAt: string;
}



/**
 * Supported messaging platforms.
 * @export
 */
export const Platform = {
    Whatsapp: 'WHATSAPP',
    Messenger: 'MESSENGER',
    Instagram: 'INSTAGRAM'
} as const;
export type Platform = typeof Platform[keyof typeof Platform];

/**
 * Schema for creating a new product.
 * @export
 * @interface ProductCreate
 */
export interface ProductCreate {
    /**
     * 
     * @type {string}
     * @memberof ProductCreate
     */
    title: string;
    /**
     * 
     * @type {number}
     * @memberof ProductCreate
     */
    priceCents: number;
    /**
     * 
     * @type {string}
     * @memberof ProductCreate
     */
    currency?: string;
    /**
     * 
     * @type {string}
     * @memberof ProductCreate
     */
    imageUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProductCreate
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProductCreate
     */
    stripePriceId: string;
}
/**
 * Schema for product list response.
 * @export
 * @interface ProductListResponse
 */
export interface ProductListResponse {
    /**
     * 
     * @type {Array<ProductOut>}
     * @memberof ProductListResponse
     */
    items: Array<ProductOut>;
    /**
     * 
     * @type {number}
     * @memberof ProductListResponse
     */
    total: number;
}
/**
 * Schema for product data in responses.
 * @export
 * @interface ProductOut
 */
export interface ProductOut {
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    title: string;
    /**
     * 
     * @type {number}
     * @memberof ProductOut
     */
    priceCents: number;
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    currency?: string;
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    imageUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    stripePriceId: string;
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof ProductOut
     */
    isActive?: boolean;
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof ProductOut
     */
    updatedAt: string;
}
/**
 * Schema for updating a product.
 * @export
 * @interface ProductUpdate
 */
export interface ProductUpdate {
    /**
     * 
     * @type {string}
     * @memberof ProductUpdate
     */
    title?: string | null;
    /**
     * 
     * @type {number}
     * @memberof ProductUpdate
     */
    priceCents?: number | null;
    /**
     * 
     * @type {string}
     * @memberof ProductUpdate
     */
    currency?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProductUpdate
     */
    imageUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProductUpdate
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProductUpdate
     */
    stripePriceId?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof ProductUpdate
     */
    isActive?: boolean | null;
}
/**
 * Schema for token refresh request.
 * @export
 * @interface RefreshTokenRequest
 */
export interface RefreshTokenRequest {
    /**
     * 
     * @type {string}
     * @memberof RefreshTokenRequest
     */
    accessToken: string;
    /**
     * 
     * @type {string}
     * @memberof RefreshTokenRequest
     */
    refreshToken: string;
}

/**
 * User roles for authorization.
 * @export
 */
export const Role = {
    Admin: 'ADMIN',
    Agent: 'AGENT'
} as const;
export type Role = typeof Role[keyof typeof Role];

/**
 * Schema for sending a message.
 * @export
 * @interface SendMessageRequest
 */
export interface SendMessageRequest {
    /**
     * 
     * @type {string}
     * @memberof SendMessageRequest
     */
    conversationId: string;
    /**
     * 
     * @type {string}
     * @memberof SendMessageRequest
     */
    text?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SendMessageRequest
     */
    imageUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SendMessageRequest
     */
    agentUserId?: string | null;
}
/**
 * Schema for send message response.
 * @export
 * @interface SendMessageResponse
 */
export interface SendMessageResponse {
    /**
     * 
     * @type {MessageOut}
     * @memberof SendMessageResponse
     */
    message: MessageOut;
    /**
     * 
     * @type {string}
     * @memberof SendMessageResponse
     */
    remoteMessageId?: string | null;
}
/**
 * 
 * @export
 * @interface SuggestionOut
 */
export interface SuggestionOut {
    /**
     * 
     * @type {string}
     * @memberof SuggestionOut
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof SuggestionOut
     */
    conversationId: string;
    /**
     * 
     * @type {string}
     * @memberof SuggestionOut
     */
    text: string;
    /**
     * 
     * @type {string}
     * @memberof SuggestionOut
     */
    createdAt: string;
}
/**
 * Schema for JWT token pair.
 * @export
 * @interface Token
 */
export interface Token {
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    accessToken: string;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    refreshToken?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    tokenType?: string;
}
/**
 * Schema for user registration request.
 * @export
 * @interface UserCreate
 */
export interface UserCreate {
    /**
     * 
     * @type {string}
     * @memberof UserCreate
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof UserCreate
     */
    password: string;
    /**
     * 
     * @type {string}
     * @memberof UserCreate
     */
    name: string;
    /**
     * 
     * @type {Role}
     * @memberof UserCreate
     */
    role?: Role;
}


/**
 * Schema for user data in responses.
 * @export
 * @interface UserOut
 */
export interface UserOut {
    /**
     * 
     * @type {string}
     * @memberof UserOut
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof UserOut
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof UserOut
     */
    name: string;
    /**
     * 
     * @type {Role}
     * @memberof UserOut
     */
    role: Role;
}


/**
 * User profile update request.
 * @export
 * @interface UserProfileUpdate
 */
export interface UserProfileUpdate {
    /**
     * 
     * @type {string}
     * @memberof UserProfileUpdate
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserProfileUpdate
     */
    email?: string | null;
}
/**
 * Schema for user data with authentication tokens.
 * @export
 * @interface UserWithTokens
 */
export interface UserWithTokens {
    /**
     * 
     * @type {UserOut}
     * @memberof UserWithTokens
     */
    user: UserOut;
    /**
     * 
     * @type {Token}
     * @memberof UserWithTokens
     */
    tokens?: Token | null;
}
/**
 * 
 * @export
 * @interface ValidationError
 */
export interface ValidationError {
    /**
     * 
     * @type {Array<LocationInner>}
     * @memberof ValidationError
     */
    loc: Array<LocationInner>;
    /**
     * 
     * @type {string}
     * @memberof ValidationError
     */
    msg: string;
    /**
     * 
     * @type {string}
     * @memberof ValidationError
     */
    type: string;
}
