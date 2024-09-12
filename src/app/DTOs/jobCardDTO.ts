import { BaseDTO } from "./baseDTO";
import { JobcardStatus } from "./enums";

export class JobCardDTO extends BaseDTO {
  referenceNumber: string;
    accountNumber: string;
    categoryId: number;
    description?: string;  // Optional field
    date: Date;
    employeeGuid: string;  // In TypeScript, GUIDs are represented as strings
    notes?: string;  // Optional field
    buildingId: number;
    divisionId: number;
    status: JobcardStatus;  // Assuming you have an enum or type defined for JobcardStatus
    action?:string;
  }