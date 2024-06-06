import { BaseDTO } from './baseDTO';

export class InvoiceDTO extends BaseDTO {
  ref?: string;
  action?: string;
  status?: string;
  orderDate?: Date;
  billFrom?: string;
  billTo?: string;
  billFromAddress?: string;
  billToAddress?: string;
  items?: InvoiceItemDTO[];
  totalCost?: number;
  completed?: boolean;
}

export class InvoiceItemDTO {
  itemName?: string;
  unitPrice?: number;
  units?: number;
  itemTotal?: number;
}
