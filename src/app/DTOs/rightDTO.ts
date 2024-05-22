import { BaseDTO } from "./baseDTO";

export class RightDTO  extends BaseDTO{
    name?: string; // Optional since it's nullable in C#
    description?: string; // Optional since it's nullable in C#

    // If needed, here's how you might declare a navigation property
    // groupList: Group[] = []; // Assuming 'Group' is a TypeScript class
}
