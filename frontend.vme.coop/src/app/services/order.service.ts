import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartPayload } from '../interfaces/cart/cart-payload.interface';
import { Cart } from '../interfaces/cart/cart.interface';
import { Order } from '../interfaces/order.interface';
import { Wrapper } from '../interfaces/wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private http: HttpClient,
  ) { }

  getOrders(page: number): Observable<Wrapper<Order>> {
    let params: any = { page };

    const queryString = new URLSearchParams(params).toString();

    return this.http.get<any>(`${environment.apiUrl}/v1/orders?${queryString}`);
  }

  fetchCart(): Observable<Cart> {
    return this.http.get<any>(`${environment.apiUrl}/v1/orders/current`);
  }

  fetchOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/orders/${orderId}`);
  }

  purchaseCart(cartId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/orders/${cartId}/payment`);
  }

  addToCart(cartItems: CartPayload[], cartId: number): Observable<void> {
    const body = cartItems.map(cartItem => ({
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
    }));

    return this.http.post<void>(`${environment.apiUrl}/v1/orders/${cartId}/items`, body);
  }

  removeFromCart(cartItems: CartPayload[], cartId: number): Observable<void> {
    const body = cartItems.map(cartItem => ({
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
    }));

    return this.http.delete<void>(`${environment.apiUrl}/v1/orders/${cartId}/items`, {
      body: body,
    });
  }

}
