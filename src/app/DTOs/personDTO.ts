import { BaseDTO } from "./baseDTO";

export class PersonDTO  extends BaseDTO{
    name: string;
    surname: string;
    email: string;
    mobile: number;
    address: string;
    action?:string;
}