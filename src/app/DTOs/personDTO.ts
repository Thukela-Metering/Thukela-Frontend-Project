export class PersonDTO {
    id: number;
    name: string;
    surname: string;
    vatNo?: string;
    email: string;
    mobile: number;
    address: string;
    action?:string;
}