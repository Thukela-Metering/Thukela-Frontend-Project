import { BaseDTO } from "./baseDTO";

export class badDeptDTO{
   id:number;
   buildingAccountId:number;
   buildingAccountNumber:string;
   note:string;
   createdAt:Date;
   closeAccount:boolean;
   amount:number;
   action?:string;
   nsp_AccountRunningBalance?:number;
}