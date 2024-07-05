import { LineItemDTO } from './LineItemDTO';
import { BaseDTO } from './baseDTO';

export class CreditNoteDTO extends BaseDTO{
    invoiceReferenceNumber?: string;
    creditNoteDate?: Date;
    creditNoteTotal?: number;
    buildingOwnerId?: number;
    buildingAccountId?: number;
    items?: LineItemDTO[];
    completed?: boolean;
  }
  