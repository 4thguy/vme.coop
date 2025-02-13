import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../interfaces/product.interface';
import { Wrapper } from '../interfaces/wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private http: HttpClient,
  ) { }

  /*
   * Returns a product by its ID
   * @param id - The product's ID
   * @return - An Observable that emits the product
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/v1/products/${id}`);
  }

  /*
   * Returns a list of products
   * @param page - The current page number (default is 1)
   * @param search - A search query string (optional)
   * @param brand - A brand name to filter by (optional)
   * @param sort - A field to sort by (optional)
   * @param direction - The sorting order ('asc' or 'desc') (optional)
   * @return - An Observable that emits a Wrapper object containing the products
   */
  getProducts(page = 1, search: string, brand: string, sort?: string, direction?: 'asc' | 'desc'): Observable<Wrapper<Product>> {
    let params: any = { page };

    if (search) {
      params.search = search;
    }

    if (brand) {
      params.brand = brand;
    }

    if (sort) {
      params.sort = sort;
    }

    if (direction) {
      params.direction = direction;
    }

    const queryString = new URLSearchParams(params).toString();

    return this.http.get<Wrapper<Product>>(`${environment.apiUrl}/v1/products?${queryString}`);
  }

  /*
   * Returns a list of brands
   * @return - An Observable that emits a Wrapper object containing the brands
   */
  getBrands(): Observable<Wrapper<string>> {
    return this.http.get<Wrapper<string>>(`${environment.apiUrl}/v1/brands`);
  }
}
