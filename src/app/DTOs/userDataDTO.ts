import { BaseDTO } from "./baseDTO";

export class UserDataDTO  extends BaseDTO{
 
    name: string;
    surname: string;
    vatNo?: string;
    email: string;
    mobile: number;
    address: string;
    username?: string;
    password?:string;
    confirmPassword?:string;
    userRole!:number;
    action?:string;
}