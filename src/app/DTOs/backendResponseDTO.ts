export class OperationalResultDTO<T> {
    success: boolean;
    message: string;
    data?: T; // The '?' makes the 'data' property optional
  
    constructor(success: boolean, message: string, data?: T) {
      this.success = success;
      this.message = message;
      this.data = data;
    }
  }