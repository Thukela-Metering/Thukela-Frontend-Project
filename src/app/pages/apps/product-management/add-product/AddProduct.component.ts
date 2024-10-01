import { Component, OnInit, OnDestroy, Optional, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { BuildingService } from 'src/app/services/building.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LookupValueDTO } from 'src/app/DTOs/lookupValueDTO';
import { OperationalResultDTO, ProductDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { LookupValueManagerService } from 'src/app/services/lookupValueManager.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-dialog-content',
  templateUrl: 'AddProduct.component.html',
})
export class AppAddProductComponent implements OnInit, OnDestroy, OnChanges {
  @Input() localDataFromComponent: ProductDTO;
  action: string;
  local_data: ProductDTO;
  DropDownValues: LookupValueDTO[] = [];
  productForm: FormGroup;
  banks = ['Bank A', 'Bank B', 'Bank C'];
  private formChangesSubscription: Subscription;
  buildingFilterCtrl: FormControl = new FormControl();

  constructor(
    @Optional() public dialogRef: MatDialogRef<AppAddProductComponent>,
    private fb: FormBuilder,
    private _productService: ProductService,
    private lookupValueService: LookupValueManagerService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ProductDTO,
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action ? this.local_data.action : "Update";
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['localDataFromComponent'] && changes['localDataFromComponent'].currentValue) {
      if (this.productForm) {
        this.productForm.patchValue(this.localDataFromComponent);
      }
    }
  }
  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', [Validators.required]],
      costPrice: ['', Validators.required],
      sellingPrice: ['', Validators.required],
      quantity: ['', Validators.required],
      isActive: ['', Validators.required]
    });
    if (this.data != null) {
      this.productForm.patchValue(this.local_data);
      console.log(this.productForm);
    }
    if (this.localDataFromComponent) {
      this.productForm.patchValue(this.localDataFromComponent);
    }
  }

  getDropdownValues(lookupGroupValue: string, lookupListValue: string) {
    this.lookupValueService.getLookupValueList(lookupGroupValue, lookupListValue).subscribe(
      (response: OperationalResultDTO<TransactionDTO>) => {
        if (response.success) {
          if (response.data != null) {
            this.DropDownValues = response.data.lookupValueDTOs!.map((item: any) => {
              const lookupValue: LookupValueDTO = new LookupValueDTO();
              lookupValue.id = item.id;
              lookupValue.name = item.name;
              lookupValue.description = item.description;
              lookupValue.lookupGroupValueId = item.lookupGroupValueId;
              lookupValue.lookupGroupValueValue = item.lookupGroupValueValue;
              lookupValue.lookupListValueId = item.lookupListValueId;
              lookupValue.lookupListValueValue = item.lookupListValueValue;
              lookupValue.dateCreated = item.dateCreated;
              return lookupValue;
            });
          }
        }
        console.log(response);
      },
      error => {
        // Handle error
        console.error(error);
      }
    );
  }



  onSubmit() {
    if (this.productForm.valid) {
      this.mapFormValuesToLocalData();

      if (this.action === "Add") {
        const buildingOwnerData = { ...this.local_data };
        this._productService.addNewProduct(buildingOwnerData).subscribe(
          response => {
            if (response.success) {
              this.snackbarService.openSnackBar(response.message, "dismiss");
              this.productForm.reset();
              // this.loadBuildingOwnerListData();
              this.finalizeDialogClose('Add', buildingOwnerData);
            }
          },
          error => {
            this.snackbarService.openSnackBar(error, "dismiss");
            console.error('Error adding building owner:', error);
          }
        );
      } else if (this.action === "Update" ||this.action === "Edit" ) {
        this.updateRowData(this.local_data);
        this.finalizeDialogClose(this.action, this.local_data);
      } else {
        this.deleteProduct(this.local_data)
      }
    }
  }
  deleteProduct(row_obj: ProductDTO) {
    this._productService.deleteProduct(row_obj).subscribe({
      next: (response) => {
        if (response.success) {
          console.log(response);
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.dialogRef.close({ event: 'Delete', data: response });
          // this.loadBuildingOwnerListData();

        } else {
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.dialogRef.close({ event: 'Delete', data: response });
          // this.loadBuildingOwnerListData();              
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.snackbarService.openSnackBar(error.message, "dismiss");
      }
    });
  }
  finalizeDialogClose(action: string, data: any) {
    setTimeout(() => {
      if (this.dialogRef) {
        this.dialogRef.close({ event: action, data: data });
      }
    }, 300);
  }



  private mapFormValuesToLocalData(): void {
    this.local_data.name = this.productForm.get('name')?.value;
    this.local_data.description = this.productForm.get('description')?.value;
    this.local_data.costPrice = this.productForm.get('costPrice')?.value;
    this.local_data.sellingPrice = this.productForm.get('sellingPrice')?.value;
    this.local_data.quantity = this.productForm.get('quantity')?.value;
    this.local_data.isActive = this.productForm.get('isActive')?.value;
  }

  updateRowData(row_obj: ProductDTO): void {
    this._productService.updateProduct(row_obj).subscribe({
      next: (response) => {
        if (response.success) {
          console.log(response);
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.dialogRef.close({ event: 'Update', data: response });
          // this.loadBuildingOwnerListData();

        } else {
          this.snackbarService.openSnackBar(response.message, "dismiss");
          this.dialogRef.close({ event: 'Update', data: response });
          // this.loadBuildingOwnerListData();              
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.snackbarService.openSnackBar(error.message, "dismiss");
      }
    });
  }


  onCancel() {
    this.productForm.reset();
    this.dialogRef.close({ event: 'Cancel' });
  }

  ngOnDestroy(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }
}
