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

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/v1/products/${id}`);
  }

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

  getBrands(): Observable<Wrapper<string>> {
    return this.http.get<Wrapper<string>>(`${environment.apiUrl}/v1/brands`);
  }
}
