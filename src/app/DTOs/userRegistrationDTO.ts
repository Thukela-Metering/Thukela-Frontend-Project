export class userRegistrationDTO {
    id: number;
    name: string;
    surname: string;
    idNumber: string;
    email: string;
    mobile: number;
    address: string;
    Username?: string;
    Password!:string;
    ConfirmPassword!:string;
    UserRole!:number;
}