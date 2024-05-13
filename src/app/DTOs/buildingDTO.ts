export class BuildingDTO {
    id: number;
    name?: string;
    nSquareMetersame?: string;
    buildingOwner?: string;
    sdgMeterZone?: string;
    address?: string;
    notes?: string;
    isActive: boolean;
    dateCreated?: Date;
    dateLastUpdated?: Date;
    dateDeleted?: Date;
    action?:string;
}