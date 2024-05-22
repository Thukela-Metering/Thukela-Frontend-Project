export class AuthenticationResponseDTO {
    userId: string;
    guid: string; // GUIDs are typically represented as strings in JavaScript/TypeScript
    accessToken?: string; // Optional property
    refreshToken?: string; // Optional property
    accessTokenExpiration: Date;

    constructor(userId?: string, accessToken?: string, refreshToken?: string, guid?: string, accessTokenExpiration?: Date) {
        this.userId = userId || '';
        this.guid = guid || '';
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.accessTokenExpiration = accessTokenExpiration || new Date();
    }
}
