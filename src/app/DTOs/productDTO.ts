import { BaseDTO } from "./baseDTO";

export class ProductDTO extends BaseDTO {
    name: string;
    description: string;
    quantity: number;
    costPrice: number;
    sellingPrice:number;
    action?:string;
}