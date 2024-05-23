export class BaseDTO {
    isActive: boolean;
    id: number;
    guid: string;
    dateCreated?: Date;
    dateLastUpdated?: Date;
    dateDeleted?: Date;
}