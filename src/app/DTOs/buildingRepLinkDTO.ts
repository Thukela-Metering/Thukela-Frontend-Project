import { BaseDTO } from "./baseDTO";

export class BuildingRepresentativeLinkDTO  extends BaseDTO {
    representativeId: number; // TypeScript does not use the 'required' keyword; all properties are required by default unless marked as optional
    buildingId: number;
  }
  