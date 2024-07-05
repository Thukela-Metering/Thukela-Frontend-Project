import { Component, AfterViewInit, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { BuildingDTO, BuildingOwnerDTO, InvoiceDTO, OperationalResultDTO, TransactionDTO } from 'src/app/DTOs/dtoIndex';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CreditNoteDTO } from 'src/app/DTOs/CreditNoteDTO';
import { CreditNoteService } from 'src/app/services/credit-note.service';
import { CreditNoteViewComponent } from './credit-note-view.component';

@Component({
  selector: 'app-credit-note-table',
  templateUrl: 'credit-note-table.component.html',
})
export class CreditNoteTableComponent implements OnInit, AfterViewInit {
  allComplete: boolean = false;
  creditNote: CreditNoteDTO[] = [];
  buildingOwnerNames: { [key: number]: string } = {};
  displayedColumns: string[] = [
    'chk',
    'ref',
    'item', 
    'billTo',
    'totalCost', 
    'action'
  ];

  dataSource = new MatTableDataSource<CreditNoteDTO>(this.creditNote);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private _creditService: CreditNoteService,
    private _ownerService: BuildingOwnerService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCreditNoteListData();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'item':
          return item.items![0]?.itemName?.toLowerCase() || '';
        case 'billTo':
          return this.buildingOwnerNames[item.buildingOwnerId ?? 0]?.toLowerCase() || '';
        case 'totalCost':
          return item.creditNoteTotal;
        case 'ref':
          return item.invoiceReferenceNumber;
        default:
          return (item as any)[property];
      }
    };
  }

  openCreditNoteDialog(creditNoteId: string): void {
    const credit = this.creditNote.find((crd) => crd.guid === creditNoteId);

    if (credit) {
      this.dialog.open(CreditNoteViewComponent, {
        width: '1600px', 
        data: credit,
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: CreditNoteDTO, filter: string) => {
      const ownerName = this.buildingOwnerNames[data.buildingOwnerId ?? 0]?.toLowerCase() || '';
      const itemName = data.items?.length ? data.items[0].itemName?.toLowerCase() : '';
      const invoiceRef = data.invoiceReferenceNumber?.toLowerCase() || '';
      
      return ownerName.includes(filter) || itemName!.includes(filter) || invoiceRef.includes(filter);
    };
    this.dataSource.filter = filterValue;
  }
  
  someComplete(): boolean {
    if (this.dataSource.data == null) {
      return false;
    }
    return this.dataSource.data.filter((t) => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean): void {
    this.allComplete = completed;
    if (this.dataSource.data == null) {
      return;
    }
    this.dataSource.data.forEach((t) => (t.completed = completed));
  }

  updateAllComplete(): void {
    this.allComplete = this.dataSource.data != null && this.dataSource.data.every((t) => t.completed);
  }

  loadCreditNoteListData(): void {
    this._creditService.getAllCreditNotes(true).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response && response.data) {
          console.log('Credit notes data received from backend:', response.data.creditNoteDTOs);
          this.creditNote = response.data.creditNoteDTOs ?? [];
          this._ownerService.getAllBuildingOwners().pipe(
            map((response: any) => {
              const owners = response.data?.buildingOwnerAccountDTOs || [];

              const ownerMap = owners.reduce((acc: { [key: number]: string }, owner: any) => {
                acc[owner.id] = owner.name;
                return acc;
              }, {});
              console.log('Owner map:', ownerMap); 
              return ownerMap;
            }),
            catchError((error) => {
              console.error('There was an error fetching building owners!', error);
              return of({});
            })
          ).subscribe((ownerMap: { [key: number]: string }) => {

            const updatedCreditNotes = this.creditNote.map((credit) => {
              const ownerName = ownerMap[credit.buildingOwnerId ?? 0];
              if (ownerName) {
                this.buildingOwnerNames[credit.buildingOwnerId ?? 0] = ownerName;
                console.log(`Matched owner for credit note ID ${credit}: ${ownerName}`);
              } else {
                console.log(`No owner found for credit note ID ${credit}`);
              }
              return credit;
            });
  
            console.log('Updated credit notes with owner names:', updatedCreditNotes); 
            this.dataSource.data = updatedCreditNotes;
            this.dataSource.sort = this.sort; 
          });
        }
      },
      error: (error) => {
        console.error('There was an error fetching credit notes!', error);
      }
    });
  }  

}
