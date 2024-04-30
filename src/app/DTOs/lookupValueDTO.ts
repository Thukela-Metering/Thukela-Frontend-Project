export class LookupValueDTO {
    Id!: number;
    Name!: string;
    Description!: string;
    LookupGroupValueId?: string;
    LookupGroupValueValue?: string;
    LookupListValueId!: string;
    LookupListValueValue!:string;
    DateCreated!:Date;

}