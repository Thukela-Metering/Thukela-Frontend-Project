import { LineItemDTO } from "./LineItemDTO";
import { StatementItemDTO } from "./StatementItemDTO";

export interface PdfDTO {
    referenceNumber?: string;
    originalRef?: string;
    invoiceDate: Date;
    dueDate: Date;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    customerEmail: string;
    taxNumber: string;
    subTotal?: number;
    discount?: number;
    vat?: number;
    grandTotal?: number;
    items?: LineItemDTO[];
    statementItems?: StatementItemDTO[];
    note?: string;
    accountIsInCredit? :boolean;
    jobDescription? :string;
    accountNumber? :string;
    category? :string;

  }