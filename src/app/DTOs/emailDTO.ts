import { BaseDTO } from "./baseDTO";

export class EmailDTO  extends BaseDTO{
  clientEmail: string;
  clientName: string;
  filename: string;
  fileContent: string; 
  fileType: string; 
  
}