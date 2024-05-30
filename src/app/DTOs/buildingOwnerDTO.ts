import { BaseDTO } from "./baseDTO";

export class BuildingOwnerDTO  extends BaseDTO{
    name: string;
    email: string;
    fax?: string;
    contactNumber?: string;
    buildingId?: number;
    accountNumber?: string;
    bank: number;
    taxable:boolean;
    address?:string;
    preferredCommunication:string;
    additionalInformation?:string;
    action?:string;
}