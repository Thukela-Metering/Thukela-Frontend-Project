import { BaseDTO } from "./baseDTO";

export class LookupValueDTO  extends BaseDTO{
    name!: string;
    description!: string;
    lookupGroupValueId?: number;
    lookupGroupValueValue?: string;
    lookupListValueId!: number;
    lookupListValueValue!:string;
    buildingId?:number;
}