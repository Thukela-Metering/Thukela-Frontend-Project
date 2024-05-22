import { BaseDTO } from "./baseDTO";


export class SetRoleRightsDTO extends BaseDTO {
    roleId: number; // Required, handled as non-optional
    categoryId: number; // Required, handled as non-optional
    typeId: number; // Required, handled as non-optional
    typeResultId: number; // Required, handled as non-optional
    routeValue?: string; // Optional, could be made required if necessary later
}
