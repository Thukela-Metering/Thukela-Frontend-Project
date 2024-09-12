import { BaseDTO } from "./baseDTO";

export class UserDataDTO  extends BaseDTO{
    name: string;
    surname: string;
    email: string;
    mobile: number;
    address: string;
    username?: string;
    password?:string;
    isThukelaEmployee?:boolean;
    confirmPassword?:string;
    userRole!:number;
    action?:string;
}