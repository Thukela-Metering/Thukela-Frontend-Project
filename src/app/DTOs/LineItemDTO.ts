import { BaseDTO } from './baseDTO';

export class LineItemDTO {
    itemName?: string;
    description?:string;
    lineDiscount?: number;
    unitPrice?: number;
    units?: number;
    itemTotal?: number;
    invoiceRef?: string;
    invoiceId?: number;
    isCreditNote: boolean;
    creditNoteLineValue: number;
  }