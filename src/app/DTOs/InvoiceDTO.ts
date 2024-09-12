import { LineItemDTO } from './LineItemDTO';
import { BaseDTO } from './baseDTO';
import { PaymentStatus } from './enums';

export class InvoiceDTO extends BaseDTO {
  referenceNumber?: string;
  action?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  buildingId?: number;
  discount?: number = 0;
  note?: string = "Note: *please contact us if no invoice received, non-receipt does not constitute grounds for non-payment!";
  buildingOwnerId?: number;
  billTo?: string;
  buildingAccountId: number;
  items?: LineItemDTO[];
  totalCost?: number;
  subTotal?: number;
  grandTotal?: number;
  vat?: number;
  completed?: boolean;
  isRecurring?: boolean;
  sendDate?: Date;
  outstandingAmount?: number;
  invoiceBalance?: number;
  runningBalance?: number;
}

