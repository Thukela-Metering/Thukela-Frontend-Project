import { BaseDTO } from "./baseDTO";


export class BuildingAccountDTO extends BaseDTO {
    buildingId?: number;
    action?:string;
    municipalityOne?: string; // Optional property
    municipalityTwo?: string; // Optional property
    readingSlip?: string; // Optional property
    creditControl?: string; // Optional property
    centerOwner?: string; // Optional property
}
