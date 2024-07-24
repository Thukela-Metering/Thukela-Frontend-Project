import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { BuildingAccountDTO, BuildingDTO, BuildingOwnerDTO, OperationalResultDTO, StatementFilterDTO, StatementItemDTO, TransactionDTO, UserDataDTO } from 'src/app/DTOs/dtoIndex';
import { FormControl } from '@angular/forms';
import { BuildingService } from 'src/app/services/building.service';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { PortfolioService } from 'src/app/services/portfolio.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatementService } from 'src/app/services/statement.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'statement',
  templateUrl: './statement.component.html'
})
export class AppStatementScreenComponent implements OnInit, AfterViewInit {
  allComplete: boolean = false;
  statementItems: StatementItemDTO[] = [];
  StatementItemList: MatTableDataSource<StatementItemDTO>;
  filterDTO: StatementFilterDTO = new StatementFilterDTO();
  selectedBuilding: BuildingDTO | null = null;
  buildingOwners: BuildingOwnerDTO[] = [];
  selectedBuildingAccount: BuildingAccountDTO;
  selectedOwnerAccount: BuildingOwnerDTO;
  selectedPerson: UserDataDTO;
  transactionData: TransactionDTO;
  buildings: BuildingDTO[] = [];
  dataLoaded: boolean = false;
  filteredBuildings: BuildingDTO[] = [];
  filteredBuildingOwners: BuildingOwnerDTO[] = [...this.buildingOwners];
  displayedColumns: string[] = [
    "Date",
    "Account",
    "Transaction",
    "Amount",
    "ClosingBalance"
  ];

  dataSource = new MatTableDataSource<StatementItemDTO>(this.statementItems);
  balanceDue: number = 0;

  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private portfolioService: PortfolioService,
    private snackBar: MatSnackBar,
    private _buildingOwnerService: BuildingOwnerService,
    private _buildingService: BuildingService,
    private _statementService: StatementService,
  ) { }

  ngOnInit(): void {
    this.loadBuildingOwnerListData();
    this.loadBuildingListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  loadBuildingListData(): void {
    this._buildingService.getAllBuildings(true).subscribe({
      next: (response: any) => {
        if (response) {
          this.buildings = response.data?.buildingDTOs ?? [];
          this.filteredBuildings = this.buildings;
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
  loadData() {
    console.log("The filter DTO :", this.filterDTO);
  
    // Convert dates to strings in the Africa/Johannesburg timezone
    const filterDTOWithStringDates: StatementFilterDTO = {
      ...this.filterDTO,
      fromDate: this.filterDTO.fromDate ? this.convertToTimeZoneString(new Date(this.filterDTO.fromDate), 'Africa/Johannesburg') : "",
      toDate: this.filterDTO.toDate ? this.convertToTimeZoneString(new Date(this.filterDTO.toDate), 'Africa/Johannesburg') : ""
    };
  
    console.log("Formatted DTO with String Dates: ", filterDTOWithStringDates);
  
    // Use the DTO with formatted dates for the API call
    this._statementService.getByAccountId(filterDTOWithStringDates).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        this.statementItems = response.data?.statementItemDTOs!;
        console.log("The statementItemList: ", this.statementItems);
        this.populateStatementItemsWithOtherData();
      },
      error: (error) => {
        this.transactionData = new TransactionDTO();
        this.snackBar.open('Error loading statement data', 'Close', { duration: 3000 });
        console.error('Error loading statement data:', error);
      }
    });
  }
  
  
  private convertToTimeZoneString(date: Date, timeZone: string): string {
    // Use moment-timezone to convert the date to the specified timezone and format to ISO string
    return moment(date).tz(timeZone).format();
  }
  onBuildingOwnerSelectionChange(event: any): void {
    this.selectedBuilding = event.value;
    console.log('Selected Building Owner:', this.selectedBuilding);
    // Update the filterDTO with the selected building owner if necessary

    this.getSelectedBuildingAccount();
  }
  getSelectedBuildingAccount() {
    this.portfolioService.getPortfolioBuildingById(this.selectedBuilding?.id!).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response.success) {
          console.log(response);
          this.transactionData = response.data!;
          if (this.transactionData!.buildingAccountDTOs![0] == null) {
            this.selectedBuildingAccount = new BuildingAccountDTO();
            this.selectedBuildingAccount.action = "Add";
          } else {
            this.selectedBuildingAccount = this.transactionData!.buildingAccountDTOs![0];
            this.selectedBuildingAccount.action = "Update";
            if (this.selectedBuildingAccount) {
              this.filterDTO.accountGuid = this.selectedBuildingAccount.guid;
              this.filterDTO.accountId = this.selectedBuildingAccount.id;
            }
          }
          if (this.transactionData!.buildingOwnerAccountDTOs![0] == null) {
            this.selectedOwnerAccount.action = "Add";
          } else {
            this.selectedOwnerAccount = this.transactionData!.buildingOwnerAccountDTOs![0];
            this.selectedOwnerAccount.action = "Update";
          }
        } else {
          this.snackBar.open('Failed to load building data', 'Close', { duration: 3000 });
        }

      },
      error: (error) => {
        this.transactionData = new TransactionDTO()
        this.snackBar.open('Error loading building data', 'Close', { duration: 3000 });
        console.error('Error loading building data:', error);
      }
    });
  }

  loadBuildingOwnerListData(): void {
    this._buildingOwnerService.getAllBuildingOwners().subscribe({
      next: (response) => {
        this.buildingOwners = response.data?.buildingOwnerAccountDTOs ?? [];
        this.filteredBuildingOwners = this.buildingOwners;
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
  calculateBalanceDue() {
    let totalInvoices = 0;
    let totalCreditsAndPayments = 0;

    this.statementItems.forEach(item => {
      const amount = parseFloat(item.amount);
      if (item.transaction.toLowerCase().includes('invoice')) {
        totalInvoices += amount;
      } else {
        totalCreditsAndPayments += amount;
      }
    });

    this.balanceDue = totalInvoices - totalCreditsAndPayments;
    if (this.balanceDue < 0) {
      this.balanceDue = -this.balanceDue;
    }
  }

  populateStatementItemsWithOtherData() {
    this.statementItems.forEach(ax => {
      ax.account = this.selectedBuildingAccount.bookNumber!;
      if (ax.transaction == "Invoice") {
        ax.transaction = ax.transaction.concat(" ", ax.id!.toString())
      } else if (ax.transaction == "CreditNote") {
        ax.transaction = ax.transaction.concat(" ", ax.id!.toString())
      }

    });
    this.dataSource.data = this.statementItems;
    this.StatementItemList = this.dataSource;
    this.dataLoaded = true;
    this.calculateBalanceDue();
  }

  filter(filterValue: string): void {
    this.StatementItemList.filter = filterValue.trim().toLowerCase();
  }

}
