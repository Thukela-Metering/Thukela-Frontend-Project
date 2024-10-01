import { Component, OnInit, AfterViewInit, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BuildingDTO, LookupGroupDTO, LookupListDTO, LookupValueDTO, OperationalResultDTO, TransactionDTO } from "src/app/DTOs/dtoIndex";
import { BuildingService } from "src/app/services/building.service";
import { LookupValueManagerService } from "src/app/services/lookupValueManager.service";
import { SnackbarService } from "src/app/services/snackbar.service";

@Component({
    templateUrl: './lookupValueManager.component.html',
    selector: "ng-component-building"
})
export class LookupValueManagerComponent implements OnInit, AfterViewInit {
    @Input() isAddForm: boolean = true;  // Input property to determine if it's an add or edit form
    isExisting: boolean = false;

    constructor(
        private lookupValueService: LookupValueManagerService,
        private _buildingService: BuildingService,
        private snackbarService: SnackbarService,
    ) { }
    firstDropdownFilterCtrl: FormControl = new FormControl();
    secondDropdownFilterCtrl: FormControl = new FormControl();
    filteredFirstDropdownOptions: any[] = [];
    filteredSecondDropdownOptions: any[] = [];
    filteredBuildingOptions: any[] = [];
    DropDownValues: LookupValueDTO[] = [];
    dropDownToSave: LookupValueDTO = new LookupValueDTO();
    selectedDropDownBuildingValue: BuildingDTO = new BuildingDTO();
    groupDropDownValues: LookupGroupDTO[] = [];
    listDropDownValues: LookupListDTO[] = [];
    buildings: BuildingDTO[] = [];
    selectedBuildingId: number | null = null;

    ngOnInit(): void {
        this.getDropdownValues("PropertyGroup", "PropertyGroup");
        this.loadBuildingListData();
        this.getDropdownGroupValues();
        this.getDropdownListValues();
        this.setDefaultValues();
    }
    setDefaultValues() {
        this.dropDownToSave = new LookupValueDTO();
        this.dropDownToSave.lookupGroupValueId = 5;
        this.dropDownToSave.lookupGroupValueValue = "PropertyGroup";
        this.dropDownToSave.lookupListValueId = 6;
        this.dropDownToSave.lookupListValueValue = "PropertyGroup";
    }

    ngAfterViewInit(): void {

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
    getDropdownGroupValues() {
        this.lookupValueService.getAllGroups().subscribe(
            (response: OperationalResultDTO<TransactionDTO>) => {
                if (response.success) {
                    if (response.data != null) {
                        this.groupDropDownValues = [];
                        this.groupDropDownValues = response.data.lookupGroupDTOs ?? []
                        this.dropDownToSave.lookupGroupValueId = this.groupDropDownValues.find(group => group.id === this.dropDownToSave.lookupGroupValueId)?.id || -1;
                        this.dropDownToSave.lookupGroupValueValue = this.groupDropDownValues.find(group => group.id === this.dropDownToSave.lookupGroupValueId)?.name || "";
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
    getDropdownListValues() {
        this.lookupValueService.getAllLists().subscribe(
            (response: OperationalResultDTO<TransactionDTO>) => {
                if (response.success) {
                    if (response.data != null) {
                        this.listDropDownValues = [];
                        this.listDropDownValues = response.data.lookupListDTOs ?? []
                        this.dropDownToSave.lookupListValueId = this.listDropDownValues.find(list => list.id === this.dropDownToSave.lookupListValueId)?.id || -1;
                        this.dropDownToSave.lookupListValueValue = this.listDropDownValues.find(list => list.id === this.dropDownToSave.lookupListValueId)?.name || "";
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
    loadBuildingListData(): void {
        this._buildingService.getAllBuildings(true).subscribe({
            next: (response: OperationalResultDTO<TransactionDTO>) => {
                if (response) {
                    this.buildings = [];
                    this.buildings = response.data?.buildingDTOs ?? [];
                }
            },
            error: (error) => {
                console.error('There was an error!', error);
            }
        });
    }
    onSwitchChange(event: any) {
        this.isExisting = event.checked;
        if (!this.isExisting) {
            this.setDefaultValues();
            this.dropDownToSave.name = "";
            this.dropDownToSave.description = "";
            this.dropDownToSave.buildingId = this.selectedBuildingId ?? -1;
        }
    }

    onExistingSelectionChange(selectedId: number) {
        const selectedItem = this.DropDownValues.find(item => item.id === selectedId);
        if (selectedItem) {
            this.dropDownToSave = { ...selectedItem };
            this.dropDownToSave.buildingId = this.selectedBuildingId ?? -1;
        }
    }
    onBuildingSelectionChange(event: any) {
        this.selectedBuildingId = event.value;
    }
    submit() {
        this.dropDownToSave.description = this.dropDownToSave.name;
        this.lookupValueService.addNewLookupValue(this.dropDownToSave).subscribe({
            next: (response: OperationalResultDTO<TransactionDTO>) => {
                console.log(response);
                if (response.success) {
                    this.getDropdownValues("PropertyGroup", "PropertyGroup");
                    this.snackbarService.openSnackBar(response.message, "dismiss");
                }
            },
            error: (error) => {
                this.snackbarService.openSnackBar(error.message, "dismiss");
                console.error('There was an error!', error);
            }
        });
    }
}
