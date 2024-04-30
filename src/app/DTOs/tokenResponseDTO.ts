export class TokenResponseDTO {
    userId: string;
    tokenValue: string;
  
    constructor(userId: string, tokenValue: string) {
      this.userId = userId;
      this.tokenValue = tokenValue;
    }
  }