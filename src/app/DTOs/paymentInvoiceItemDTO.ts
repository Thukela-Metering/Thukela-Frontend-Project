import { PaymentStatus } from "./enums";

export class PaymentInvoiceItemDTO {
    id: string;
    invoiceDate: string;
    invoiceAmount: number;
    amountAlreadyPayed: number;
    invoiceNumber: string;
    invoiceReference: string;
    paymentAmount?: number;
    status?: PaymentStatus;
    outstandingAmount?: number;
    isSelected?: boolean = false; // Add this property
  }