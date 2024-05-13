export class UserDataDTO {
    id: number;
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
    isActive:boolean;
    dateDeleted?:Date;
}