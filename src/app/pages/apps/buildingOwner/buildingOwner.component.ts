import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BuildingOwnerDTO } from 'src/app/DTOs/buildingOwnerDTO';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
    templateUrl: './buildingOwner.component.html',
    selector: 'app-building-owner',
})
export class AppBuildingOwnerComponent implements OnInit {
    accountForm: FormGroup;
    banks = ['Bank A', 'Bank B', 'Bank C'];
    private formChangesSubscription: Subscription;

    constructor(private fb: FormBuilder, private _buildingOwnerService: BuildingOwnerService,private snackbarService: SnackbarService) { }

    ngOnInit(): void {
        this.accountForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            fax: [''],
            contactNumber: [''], // Initially not required
            buildingId: [''],
            accountNumber: [''],
            bank: ['', Validators.required],
            taxable: [false, Validators.required],
            address: [''],
            preferredCommunication: ['', Validators.required],
            additionalInformation: ['']
        });

        this.onPreferredCommunicationChange();
    }

    onPreferredCommunicationChange() {
        this.formChangesSubscription = this.accountForm.get('preferredCommunication')!.valueChanges
            .subscribe(value => {
                const contactNumberControl = this.accountForm.get('contactNumber');
                if (value === 'mobile') {
                    contactNumberControl?.setValidators([Validators.required]);
                } else {
                    contactNumberControl?.clearValidators();
                }
                contactNumberControl?.updateValueAndValidity(); // Important to apply the validation changes
            });
    }

    onSubmit() {
        if (this.accountForm.valid) {
            console.log(this.accountForm.value);
            const buildingOwnerData = new BuildingOwnerDTO();
            Object.assign(buildingOwnerData, this.accountForm.value, {
                preferredCommunication: this.accountForm.value.preferredCommunication === 'email'
            });
            this._buildingOwnerService.addNewBuildingOwner(buildingOwnerData).subscribe(
                response => {
                    // Handle response here
                    console.log('Building owner added successfully:', response);
                    if(response.success){
                        this.snackbarService.openSnackBar(response.message, "dismiss");
                        this.accountForm.reset();
                    }
                },
                error => {
                    this.snackbarService.openSnackBar(error, "dismiss");
                    // Handle errors here
                    console.error('Error adding building owner:', error);
                }
            );
            // Further processing like API integration
        }
    }

    onCancel() {
        this.accountForm.reset();
    }

    ngOnDestroy() {
        if (this.formChangesSubscription) {
            this.formChangesSubscription.unsubscribe(); // Prevent memory leaks
        }
    }
}
