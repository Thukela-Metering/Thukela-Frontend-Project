import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { BuildingAccountDTO, BuildingDTO, BuildingOwnerDTO } from "src/app/DTOs/dtoIndex";
import { AppAddInvoiceComponent } from "../../invoice/add-invoice.component";

@Component({
  selector: 'app-add-new-portfolio-for-convert',
  templateUrl: './add-new-portfolio-for-convert.component.html',
})
export class AddNewPortfolioForConvertComponent implements OnInit {
  selectedBuilding: BuildingDTO = new BuildingDTO();
  selectedBuildingAccount: BuildingAccountDTO = new BuildingAccountDTO();
  selectedOwnerAccount: BuildingOwnerDTO = new BuildingOwnerDTO();

  isBuildingAdded = false;
  isAccountAdded = false;
  isOwnerAdded = false;

  constructor(
    public dialogRef: MatDialogRef<AddNewPortfolioForConvertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Initialize selectedBuilding
    if (this.data.selectedBuilding) {
      this.selectedBuilding = this.data.selectedBuilding;
      this.selectedBuilding.action = "Add";
    }

    // Initialize selectedBuildingAccount
    if (this.data.selectedBuildingAccount) {
      this.selectedBuildingAccount = this.data.selectedBuildingAccount;
      this.selectedBuildingAccount.action = "Add";
    }

    // Initialize selectedOwnerAccount
    if (this.data.selectedOwnerAccount) {
      this.selectedOwnerAccount = this.data.selectedOwnerAccount;
      this.selectedOwnerAccount.action = "Add";
    }
  }

  onBuildingAdded(newBuilding: BuildingDTO): void {
    console.log("Building added in parent component:", newBuilding);
    this.isBuildingAdded = true;
    this.selectedBuilding = newBuilding;
  }
  
  onAccountAdded(newAccount: BuildingAccountDTO): void {
    this.isAccountAdded = true;
    this.selectedBuildingAccount = newAccount;
  }
  
  onOwnerAdded(newOwner: BuildingOwnerDTO): void {
    this.isOwnerAdded = true;
    this.selectedOwnerAccount = newOwner;
  }  

  canProceedToInvoice(): boolean {
    return this.isBuildingAdded && this.isAccountAdded && this.isOwnerAdded;
  }

  proceedToInvoice(): void {
    if (this.canProceedToInvoice()) {
      // Prepare the result data to send back
      const result = {
        action: 'Add',
        selectedBuilding: this.selectedBuilding,
        selectedBuildingAccount: this.selectedBuildingAccount,
        selectedOwnerAccount: this.selectedOwnerAccount
      };
  
      // Close the dialog and pass the result
      this.dialogRef.close(result);
    }
  }   

  closeDialog(): void {
    this.dialogRef.close();
  }
}
