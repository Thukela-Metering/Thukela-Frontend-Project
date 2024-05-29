import { AuthenticationResponseDTO } from "./AuthenticationResponseDTO";
import { BuildingAccountDTO } from "./BuildingAccountDTO";
import { BuildingDTO } from "./buildingDTO";
import { BuildingOwnerDTO } from "./buildingOwnerDTO";
import { BuildingRepresentativeLinkDTO } from "./buildingRepLinkDTO";
import { LookupGroupDTO } from "./lookupGroupDTO";
import { LookupListDTO } from "./lookupListDTO";
import { LookupValueDTO } from "./lookupValueDTO";
import { PersonDTO } from "./personDTO";
import { PortfolioDTO } from "./portfolioDTO";
import { RightDTO } from "./rightDTO";
import { RoleDTO } from "./roleDTO";
import { SetRoleRightsDTO } from "./setRoleRightDTO";
import { SystemUserDTO } from "./systemUserDTO";
import { UserDataDTO } from "./userDataDTO";
import { userLoginDTO } from "./userLoginDTO";

export class TransactionDTO {
    authenticationResponseDTOs?: AuthenticationResponseDTO[];
    buildingAccountDTOs?: BuildingAccountDTO[];
    buildingDTOs?: BuildingDTO[];
    buildingOwnerAccountDTOs?: BuildingOwnerDTO[];
    buildingRepresentativeLinkDTOs?: BuildingRepresentativeLinkDTO[];
    lookupGroupDTOs?: LookupGroupDTO[];
    lookupListDTOs?: LookupListDTO[];
    lookupValueDTOs?: LookupValueDTO[];
    personDTOs?: PersonDTO[];
    portfolioDTOs?: PortfolioDTO[];
    rightDTOs?: RightDTO[];
    roleDTOs?: RoleDTO[];
    setRoleRightsDTOs?: SetRoleRightsDTO[];
    systemUserDTOs?: SystemUserDTO[];
    userDataDTOs?: UserDataDTO[];
    userLoginDTOs?: userLoginDTO[];

    stringResponseProperty?: string;
    intResponseProperty?: number;
    boolResponseProperty?: boolean;
    guidResponseProperty?: string;
}