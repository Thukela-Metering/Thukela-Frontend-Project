import { BaseDTO } from "./baseDTO";

export class PaymentDTO extends BaseDTO{
    amount: number;
    paymentDate: Date;
    paymentMethod?: number;
    invoiceReference: string;
    invoiceId: number;
    buildingAccountId: number; 
    outstandingAmount: number;
  }
