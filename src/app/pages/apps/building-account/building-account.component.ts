import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BuildingAccountDTO } from 'src/app/DTOs/BuildingAccountDTO';
import { BuildingAccountService } from 'src/app/services/building-account.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
@Component({
  selector: 'app-building-accounts',
  templateUrl: './building-account.component.html',
})
export class BuildingAccountsComponent implements OnInit {
  accountsForm: FormGroup;
  buildingAccount: BuildingAccountDTO[] = [];
  constructor(private fb: FormBuilder, private _buildingAccountService: BuildingAccountService, private snackbarService: SnackbarService) {}
  ngOnInit():void {
    this.accountsForm = this.fb.group({
      buildingId: ['', Validators.required],
      municipalityOne: ['', Validators.required],
      municipalityTwo: [''],
      readingSlip: ['', Validators.required],
      creditControl: [''],
      centerOwner: ['', Validators.required]
    });
  }
  onSubmit(row_obj: BuildingAccountDTO): void {
      this._buildingAccountService.addNewBuildingAccount(row_obj).subscribe(
        response => {
          console.log(response);

          var buildingAccountDTO = new BuildingAccountDTO();
          buildingAccountDTO.buildingId = row_obj.buildingId,
          buildingAccountDTO.isActive = true,
          buildingAccountDTO.centerOwner = row_obj.centerOwner,
          buildingAccountDTO.creditControl = row_obj.creditControl,
          buildingAccountDTO.municipalityOne = row_obj.municipalityOne,
          buildingAccountDTO.municipalityTwo = row_obj.municipalityTwo,
          buildingAccountDTO.readingSlip = row_obj.readingSlip,
          this.buildingAccount.push(buildingAccountDTO);
          console.log(buildingAccountDTO);
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.accountsForm.reset();
        },
        error => {
          console.error(error);
          this.snackbarService.openSnackBar(error.message, "dismiss");
        }
    );
  }

  onCancel() {
    // Reset the form or navigate away
    this.accountsForm.reset();
  }
}