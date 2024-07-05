export class PaymentInvoiceItemDTO {
    id: string;
    invoiceDate: string;
    invoiceAmount: number;
    amountAlreadyPaid: number;
    invoiceNumber: string;
    invoiceReference: string;
    paymentAmount?: number; // Add paymentAmount property
  }