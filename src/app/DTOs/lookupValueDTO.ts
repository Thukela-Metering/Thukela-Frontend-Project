import { BaseDTO } from "./baseDTO";

export class LookupValueDTO  extends BaseDTO{
    name!: string;
    description!: string;
    lookupGroupValueId?: string;
    lookupGroupValueValue?: string;
    lookupListValueId!: string;
    lookupListValueValue!:string;
}