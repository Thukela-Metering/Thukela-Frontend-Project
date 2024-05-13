export class BuildingRepresentativeLinkDTO {
    id: number;
    representativeId: number; // TypeScript does not use the 'required' keyword; all properties are required by default unless marked as optional
    isActive: boolean;
    buildingId: number;
    dateCreated: Date; // Use 'Date' type for date objects in TypeScript
    dateDeleted?: Date | null; // '?' makes the property optional, indicating it can be absent or null
  }
  