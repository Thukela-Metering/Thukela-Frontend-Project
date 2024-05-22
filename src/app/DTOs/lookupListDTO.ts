import { BaseDTO } from "./baseDTO";

export class LookupListDTO  extends BaseDTO{

    name!: string;
    description!: string;
    lookupGroupValueId!: number;
    lookupGroupValueValue!: string;

  }