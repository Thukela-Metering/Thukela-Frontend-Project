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
    // this.statementItems = [
    //   // First dataset
    //   {
    //     isActive: true,
    //     id: 1,
    //     guid: 'guid-1',
    //     dateCreated: new Date('2024-01-01'),
    //     dateLastUpdated: new Date('2024-01-01'),
    //     dateDeleted: undefined,
    //     invoiceId: 1001,
    //     creditNoteId: 0,
    //     referenceNumber: 'INV-1001',
    //     date: new Date('2024-01-01'),
    //     account: 'Account A',
    //     transaction: 'Invoice',
    //     amount: '100.00',
    //     closingBalance: '100.00'
    //   },
    //   {
    //     isActive: true,
    //     id: 2,
    //     guid: 'guid-2',
    //     dateCreated: new Date('2024-01-15'),
    //     dateLastUpdated: new Date('2024-01-15'),
    //     dateDeleted: undefined,
    //     invoiceId: 0,
    //     creditNoteId: 2001,
    //     referenceNumber: 'CN-2001',
    //     date: new Date('2024-01-15'),
    //     account: 'Account A',
    //     transaction: 'Credit Note',
    //     amount: '-50.00',
    //     closingBalance: '50.00'
    //   },
    //   {
    //     isActive: true,
    //     id: 3,
    //     guid: 'guid-3',
    //     dateCreated: new Date('2024-01-31'),
    //     dateLastUpdated: new Date('2024-01-31'),
    //     dateDeleted: undefined,
    //     invoiceId: 0,
    //     creditNoteId: 0,
    //     referenceNumber: 'PAY-3001',
    //     date: new Date('2024-01-31'),
    //     account: 'Account A',
    //     transaction: 'Payment',
    //     amount: '-50.00',
    //     closingBalance: '0.00'
    //   },

    //   // Second dataset
    //   {
    //     isActive: true,
    //     id: 4,
    //     guid: 'guid-4',
    //     dateCreated: new Date('2024-02-01'),
    //     dateLastUpdated: new Date('2024-02-01'),
    //     dateDeleted: undefined,
    //     invoiceId: 1002,
    //     creditNoteId: 0,
    //     referenceNumber: 'INV-1002',
    //     date: new Date('2024-02-01'),
    //     account: 'Account B',
    //     transaction: 'Invoice',
    //     amount: '2000.00',
    //     closingBalance: '200.00'
    //   },
    //   {
    //     isActive: true,
    //     id: 5,
    //     guid: 'guid-5',
    //     dateCreated: new Date('2024-02-15'),
    //     dateLastUpdated: new Date('2024-02-15'),
    //     dateDeleted: undefined,
    //     invoiceId: 0,
    //     creditNoteId: 2002,
    //     referenceNumber: 'CN-2002',
    //     date: new Date('2024-02-15'),
    //     account: 'Account B',
    //     transaction: 'Credit Note',
    //     amount: '-75.00',
    //     closingBalance: '125.00'
    //   },
    //   {
    //     isActive: true,
    //     id: 6,
    //     guid: 'guid-6',
    //     dateCreated: new Date('2024-02-28'),
    //     dateLastUpdated: new Date('2024-02-28'),
    //     dateDeleted: undefined,
    //     invoiceId: 0,
    //     creditNoteId: 0,
    //     referenceNumber: 'PAY-3002',
    //     date: new Date('2024-02-28'),
    //     account: 'Account B',
    //     transaction: 'Payment',
    //     amount: '-125.00',
    //     closingBalance: '0.00'
    //   },

    //   // Third dataset
    //   {
    //     isActive: true,
    //     id: 7,
    //     guid: 'guid-7',
    //     dateCreated: new Date('2024-03-01'),
    //     dateLastUpdated: new Date('2024-03-01'),
    //     dateDeleted: undefined,
    //     invoiceId: 1003,
    //     creditNoteId: 0,
    //     referenceNumber: 'INV-1003',
    //     date: new Date('2024-03-01'),
    //     account: 'Account C',
    //     transaction: 'Invoice',
    //     amount: '300.00',
    //     closingBalance: '300.00'
    //   },
    //   {
    //     isActive: true,
    //     id: 8,
    //     guid: 'guid-8',
    //     dateCreated: new Date('2024-03-15'),
    //     dateLastUpdated: new Date('2024-03-15'),
    //     dateDeleted: undefined,
    //     invoiceId: 0,
    //     creditNoteId: 2003,
    //     referenceNumber: 'CN-2003',
    //     date: new Date('2024-03-15'),
    //     account: 'Account C',
    //     transaction: 'Credit Note',
    //     amount: '-100.00',
    //     closingBalance: '200.00'
    //   },
    //   {
    //     isActive: true,
    //     id: 9,
    //     guid: 'guid-9',
    //     dateCreated: new Date('2024-07-08'),
    //     dateLastUpdated: new Date('2024-07-08'),
    //     dateDeleted: undefined,
    //     invoiceId: 0,
    //     creditNoteId: 0,
    //     referenceNumber: 'PAY-3003',
    //     date: new Date('2024-07-08'),
    //     account: 'Account C',
    //     transaction: 'Payment',
    //     amount: '-200.00',
    //     closingBalance: '0.00'
    //   }
    // ];

    this._statementService.getByAccountId(this.filterDTO).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        this.statementItems = response.data?.statementItemDTOs!;
        console.log("The statementItemList: ");
        console.log(this.StatementItemList);
        this.populateStatementItemsWithOtherData();
      },
      error: (error) => {
        this.transactionData = new TransactionDTO()
        this.snackBar.open('Error loading statement data', 'Close', { duration: 3000 });
        console.error('Error loading statement data:', error);
      }
    })


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
        ax.transaction = ax.transaction.concat(" ", ax.id.toString())
      } else if (ax.transaction == "CreditNote") {
        ax.transaction = ax.transaction.concat(" ", ax.id.toString())
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
