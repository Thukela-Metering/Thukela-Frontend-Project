import { BaseDTO } from "./baseDTO";


export class BuildingAccountDTO extends BaseDTO {
    buildingId?: number;
    action?:string;
    municipalityOne?: string; // Optional property
    municipalityTwo?: string; // Optional property
    readingSlip?: boolean; // Optional property
    creditControl?: boolean; // Optional property
    buildingTaxNumber?:string;
    bookNumber?: string;
    accountRunningBalance?:number;
    isInCredit?:boolean;
}
