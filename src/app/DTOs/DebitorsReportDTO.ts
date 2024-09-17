export class DebitorReportDTO {
    buildingOwnerName: string;
    buildingName: string;
    amountExclVat?: number;  // Optional field
    amountInclVat?: number;  // Optional field
    vatTotal?: number;       // Optional field
    isSales?: boolean;       // Optional field
    isBadDept?: boolean;  
    usCreditNote?:boolean;   // Optional field
    isTotalsRow?: boolean;   // Optional field
  }