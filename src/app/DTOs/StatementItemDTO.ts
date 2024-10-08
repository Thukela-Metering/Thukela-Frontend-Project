import { BaseDTO } from "./dtoIndex";

export class StatementItemDTO extends BaseDTO {
    invoiceId: number;
    creditNoteId: number;
    referenceNumber: string;
    date: Date;
    accountNumber: string;
    transaction: string;
    amount: string;
    closingBalance: string;
}