import { BaseDTO } from "./baseDTO";

export interface SystemUserDTO  extends BaseDTO{  
    personId: number;
    username: string;  // 'required' in C# translates to not allowing null or undefined
    password: string;  // 'required' in C# translates to not allowing null or undefined
    confirmPassword: string; 
    userRole: number;
    lastLoginAttempt: Date;
  }