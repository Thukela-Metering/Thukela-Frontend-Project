import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BuildingDTO } from "../DTOs/buildingDTO";
import { OperationalResultDTO, ProductDTO, TransactionDTO } from "../DTOs/dtoIndex";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private http: HttpClient) { }

    private apiUrl = 'http://localhost:8080/api';
  //  private apiUrl = 'https://thukelameteringproduction.co.za/api';

    updateProduct(productData: ProductDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Product/Update/${productData.id}`, productData);
        return response;
    }

    getProductById(productId: number): Observable<OperationalResultDTO<TransactionDTO>> {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Product/Update/${productId}`, {
            params: {
                ProductId: productId
            }
        });
        return getResponse;
    }
    getProductByGuid(productGuid: string): Observable<OperationalResultDTO<TransactionDTO>> {
        var getResponse = this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Product/${productGuid}`, {
            params: {
                Id: productGuid
            }
        });
        return getResponse;
    }

    deleteProduct(productData: ProductDTO): Observable<OperationalResultDTO<TransactionDTO>> {
        var response = this.http.put<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Product/Delete/${productData.id}`, productData);
        return response;
    }

    getProductList( isActive: boolean): Observable<OperationalResultDTO<TransactionDTO>> {
        const params = new HttpParams()
            .set('isActive', isActive.toString());

        return this.http.get<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Product/All`,{params});
    }

    addNewProduct(productToSave:ProductDTO):Observable<OperationalResultDTO<TransactionDTO>>{
        {
        var getResponse = this.http.post<OperationalResultDTO<TransactionDTO>>(`${this.apiUrl}/Product/Create`,productToSave);
        return getResponse;
        }
      }
}
