import { BaseDTO, PaymentInvoiceItemDTO } from "./dtoIndex";



export class PaymentDTO extends BaseDTO {
  amount: number;
  paymentDate: Date;
  paymentMethod?: number;
  buildingAccountId: number;
  outstandingAmount: number;
  InvoicesPayed?: PaymentInvoiceItemDTO[] = [];
  amountOfRemainingCredit?: number = 0
}
