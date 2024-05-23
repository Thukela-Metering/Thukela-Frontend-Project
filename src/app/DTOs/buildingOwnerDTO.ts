import { BaseDTO } from "./baseDTO";

export class BuildingOwnerDTO  extends BaseDTO{
    name: string;
    email: string;
    fax?: string;
    contactNumber?: string;
    buildingId?: number;
    accountNumber?: string;
    bank: string;
    taxable:boolean;
    address?:string;
    preferedCommunication:boolean;
    additionalInformation?:string;
}