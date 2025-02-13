import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../interfaces/order.interface';
import { Wrapper } from '../interfaces/wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private http: HttpClient,
  ) { }


  /*
   * Get all orders
   * @param page - The current page number (default is 1)
   * @returns An Observable that emits a Wrapper object containing the orders
   */
  getOrders(page: number = 1): Observable<Wrapper<Order>> {
    let params: any = { page };

    const queryString = new URLSearchParams(params).toString();

    return this.http.get<any>(`${environment.apiUrl}/v1/orders?${queryString}`);
  }

  /*
   * Get a specific order by ID
   * @param orderId - The ID of the order to retrieve
   * @returns An Observable that emits the order
   */
  getOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/orders/${orderId}`);
  }

}
