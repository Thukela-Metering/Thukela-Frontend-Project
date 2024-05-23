import { BaseDTO } from "./baseDTO";

export class BuildingDTO  extends BaseDTO{
    name?: string;
    nSquareMetersame?: string;
    buildingOwner?: string;
    sdgMeterZone?: string;
    address?: string;
    notes?: string;
    action?:string;
}