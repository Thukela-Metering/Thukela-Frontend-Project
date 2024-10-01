import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatSort } from '@angular/material/sort';
import { AppAddProductComponent } from '../add-product/AddProduct.component';
import { ProductDTO } from 'src/app/DTOs/dtoIndex';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-table',
  templateUrl: './productTable.component.html',
})
export class AppProductTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  searchText: any;
  manageActiveProducts: boolean = true;
  productList: ProductDTO[] = [];
  displayedColumns: string[] = [
    'name',
    'description',
    'costPrice',
    'sellingPrice',
    'quantity',
    'action'
  ];

  dataSource = new MatTableDataSource<ProductDTO>(this.productList);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private _productService: ProductService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.manageActiveProducts = true;
    this.loadProductListData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item.name?.trim().toLowerCase() || '';
        case 'description':
          return item.description?.trim().toLowerCase() || '';
        case 'costPrice':
          return item.costPrice;
        case 'sellingPrice':
          return item.sellingPrice;
        case 'quantity':
          return item.quantity;        
        default:
          return (item as any)[property];
      }
    };
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadProductListData(): void {
    this.productList = [];
    this.dataSource.data = [];
    this._productService.getProductList(this.manageActiveProducts).subscribe({
      next: (response) => {
        if (response && response.data) {
          if(response.success){
            console.log("Here is the response for all products:",response)
          this.productList = response.data.productDTOs ?? [];
          this.dataSource.data = response.data.productDTOs ?? [];
          this.filterProducts();
        }
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }

  filterProducts(): void {
    if (this.manageActiveProducts) {
      this.dataSource.data = this.productList.filter(product => product.isActive);
    } else {
      this.dataSource.data = this.productList.filter(product => !product.isActive);
    }
  }

  toggleActionMenu(element: ProductDTO): void {
    element.showActionMenu = !element.showActionMenu;
  }

  updateProductQuantity(element: ProductDTO): void {
    this._productService.updateProduct(element).subscribe({
      next: (response) => {
        if (response) {
          this.snackbarService.openSnackBar('Quantity updated successfully', 'Close');
        }
      },
      error: (error) => {
        this.snackbarService.openSnackBar('Error updating quantity', 'Close');
        console.error('There was an error!', error);
      }
    });
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AppAddProductComponent, {
      width: '500px',
      data: obj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        if (result.event === 'Add' || result.event === 'Update' ) {
          setTimeout(() => {
          this.loadProductListData();
          },1000);
        }else if(result.event === 'Delete')
          {
            setTimeout(() => {
            this.loadProductListData();
            },1000);
            this.deleteRowData(result);        
          }
      }      
    });
  }

  deleteRowData(row_obj: ProductDTO): boolean | any {
    row_obj.isActive = false;
    row_obj.dateDeleted = new Date();
    row_obj.dateDeleted.setHours(0, 0, 0, 0);
    this._productService.deleteProduct(row_obj).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
        }
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
    return true;
  }
}
