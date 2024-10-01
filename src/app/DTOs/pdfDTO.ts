import { DebitorReportDTO, DebitorSummaryReportDTO } from "./dtoIndex";
import { LineItemDTO } from "./LineItemDTO";
import { StatementItemDTO } from "./StatementItemDTO";

export class PdfDTO {
    referenceNumber?: string;
    originalRef?: string;
    invoiceDate?: Date;
    dueDate?: Date;
    customerName?: string;
    customerAddress?: string;
    customerPhone?: string;
    customerEmail?: string;
    taxNumber?: string;
    subTotal?: number;
    discount?: number;
    vat?: number;
    grandTotal?: number;
    items?: LineItemDTO[];
    statementItems?: StatementItemDTO[];
    reportSalesItems?: DebitorReportDTO[];
    reportBadDeptItems?: DebitorReportDTO[];
    reportSummaryItems?: DebitorSummaryReportDTO[];
    filterStartDate?:Date;
    filterEndDate?:Date;
    note?: string;
    accountIsInCredit? :boolean;
    jobDescription? :string;
    accountNumber? :string;
    category? :string;

  }