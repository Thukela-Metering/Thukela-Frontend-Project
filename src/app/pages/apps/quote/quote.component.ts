import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { map, catchError, of, forkJoin } from 'rxjs';
import { OperationalResultDTO } from 'src/app/DTOs/operationalResultDTO';
import { TransactionDTO } from 'src/app/DTOs/transactionDTO';
import { QuoteService } from 'src/app/services/quotes.service';
import { QuotesDTO } from 'src/app/DTOs/QuotesDTO';
import { BuildingOwnerService } from 'src/app/services/buildingOwner.service';
import { AddquoteComponent } from './addquote/addquote.component';
import { ViewQuoteComponent } from './view-quote/view-quote.component';
import { TempClientDTO } from 'src/app/DTOs/tempClientDTO';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
})
export class QuoteComponent implements OnInit, AfterViewInit {
  quotes: QuotesDTO[] = [];
  displayedColumns: string[] = ['quoteNumber', 'item', 'billTo', 'totalCost', 'action'];
  buildingOwnerNames: { [key: number]: string } = {};
  tempClientNames: { [key: number]: string } = {};
  dataSource = new MatTableDataSource<QuotesDTO>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private _quoteService: QuoteService,
    private _ownerService: BuildingOwnerService,
  ) {}

  ngOnInit(): void {
    this.loadQuotesListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Customize sorting for specific columns
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'item':
          return item.items![0]?.itemName?.toLowerCase() || '';
        case 'billTo':
          return this.tempClientNames[item.tempClient?.id ?? 0]?.toLowerCase() || this.buildingOwnerNames[item.buildingOwnerId ?? 0]?.toLowerCase() || '';
        case 'totalCost':
          return item.grandTotal;
        case 'quoteNumber':
          return item.quoteNumber;
        default:
          return (item as any)[property];
      }
    };
  }

  openDialog(action: string, quoteId?: string): void {
    if (quoteId) {
        this._quoteService.getQuoteByGuid(quoteId).subscribe({
            next: (response: OperationalResultDTO<TransactionDTO>) => {
                if (response && response.data) {
                    let quote = response.data.quotesDTOs?.find(qt => qt.guid === quoteId);

                    if (quote?.tempClient?.guid) {
                        // Fetch the TempClient details if tempClient is associated
                        this._quoteService.getTempClientById(quote.tempClient.guid!).subscribe({
                            next: (tempClientResponse: OperationalResultDTO<TempClientDTO>) => {
                                quote!.tempClient = tempClientResponse.data;
                                this.openAddQuoteDialog({ action, quote });
                            },
                            error: (error) => {
                                console.error('There was an error fetching the temp client details!', error);
                                this.openAddQuoteDialog({ action, quote });
                            }
                        });
                    } else {
                        // If no TempClient is associated, just open the dialog with the quote
                        this.openAddQuoteDialog({ action, quote });
                    }
                }
            },
            error: (error) => {
                console.error('There was an error fetching the quote!', error);
            },
        });
    } else {
        this.openAddQuoteDialog({ action });
    }
}
  
openAddQuoteDialog(data: any): void {
  console.log('Data being passed to AddquoteComponent:', data);
  
  const dialogRef = this.dialog.open(AddquoteComponent, {
      width: '1600px',
      data: data,
  });

  dialogRef.afterClosed().subscribe((result) => {
      if (result) {
          this.loadQuotesListData();
      }
  });
}


openViewDialog(quoteId: number): void {
  const quote = this.quotes.find((qt) => qt.id === quoteId);

  if (quote) {
    const dialogRef = this.dialog.open(ViewQuoteComponent, {
      width: '1600px',
      data: quote,
    });

    dialogRef.componentInstance.dialogClosed.subscribe(() => {
      this.loadQuotesListData();  // Refresh the table when the dialog is closed
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadQuotesListData();
      }
    });
  }
}

  loadQuotesListData(): void {
    this._quoteService.getAllQuotes(true).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response && response.data) {
          this.quotes = response.data.quotesDTOs ?? [];

          const ownerRequests = this.quotes.map((quote) => {
            if (quote.buildingOwnerId && quote.buildingId) {
              return this._ownerService.getBuildingOwnerAccountByBuildingId(quote.buildingId, true).pipe(
                map((response: any) => {
                  const owner = response.data?.buildingOwnerAccountDTOs[0] || null;
                  if (owner) {
                    this.buildingOwnerNames[quote.buildingOwnerId ?? 0] = owner.name;
                  }
                  return quote;
                }),
                catchError((error) => {
                  console.error('There was an error!', error);
                  return of(quote);
                })
              );
            } else if (quote.tempClient?.guid) {
              return this._quoteService.getTempClientById(quote.tempClient.guid!).pipe(
                map((response: OperationalResultDTO<TempClientDTO>) => {
                  const tempClient = response.data;
                  if (tempClient) {
                    this.tempClientNames[quote.tempClient?.id ?? 0] = tempClient.name ?? '';
                  }
                  return quote;
                }),
                catchError((error) => {
                  console.error('There was an error fetching the temp client!', error);
                  return of(quote);
                })
              );
            } else {
              return of(quote);
            }
          });

          forkJoin(ownerRequests).subscribe((updatedQuotes) => {
            this.dataSource.data = updatedQuotes;
          });
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data, filter) => {
      const ownerName = this.tempClientNames[data.tempClient?.id ?? 0]?.toLowerCase() || this.buildingOwnerNames[data.buildingOwnerId ?? 0]?.toLowerCase() || '';
      return ownerName.includes(filter) || (data.items![0]?.itemName?.toLowerCase() || '').includes(filter) || (data.quoteNumber?.toString().toLowerCase() || '').includes(filter);
    };
    this.dataSource.filter = filterValue;
  }
}
