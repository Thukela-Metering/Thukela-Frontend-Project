export interface SystemUserDTO {
    id: number;
    personId: number;
    username: string;  // 'required' in C# translates to not allowing null or undefined
    password: string;  // 'required' in C# translates to not allowing null or undefined
    confirmPassword: string; 
    userRole: number;
    dateCreated: Date;
    lastLoginAttempt: Date;
  }