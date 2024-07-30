export class PaymentInvoiceItemDTO {
    id: string;
    invoiceDate: string;
    invoiceAmount: number;
    amountAlreadyPayed: number;
    invoiceNumber: string;
    invoiceReference: string;
    paymentAmount?: number;
    outstandingAmount?: number;
    isSelected?: boolean = false; // Add this property
  }