import { BaseDTO } from "./baseDTO";


export class BuildingAccountDTO extends BaseDTO {
    buildingId?: number;
    municipalityOne?: string; // Optional property
    municipalityTwo?: string; // Optional property
    readingSlip?: string; // Optional property
    creditControl?: string; // Optional property
    centerOwner?: string; // Optional property
}
