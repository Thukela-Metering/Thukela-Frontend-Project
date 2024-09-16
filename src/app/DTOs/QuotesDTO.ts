import { BaseDTO } from "./baseDTO";
import { LineItemDTO } from "./LineItemDTO";
import { TempClientDTO } from "./tempClientDTO";

export class QuotesDTO extends BaseDTO {
  buildingId: number;
  buildingOwnerId: number;
  items?: LineItemDTO[];
  discount?: number = 0;
  note?: string = "Price basis: The prices are fixed and firm for the validity period and include VAT. Validity: 30 Days";
  totalCost?: number;
  subTotal?: number;
  grandTotal?: number;
  vat?: number;
  billTo?: string;
  quoteNumber?: number;
  buildingAccountId: number;
  quoteDate: Date;
  tempClient?: TempClientDTO;
  invoiceConvert?: boolean;
  invoiceRef?: string;
}