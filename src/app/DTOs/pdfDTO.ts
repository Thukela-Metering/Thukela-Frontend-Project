import { LineItemDTO } from "./LineItemDTO";

export interface PdfDTO {
    referenceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    customerEmail: string;
    taxNumber: string;
    subTotal: number;
    discount: number;
    vat: number;
    grandTotal: number;
    items: LineItemDTO[];
    note: string;
  }