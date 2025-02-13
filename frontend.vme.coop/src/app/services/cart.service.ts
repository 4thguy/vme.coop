import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartPayload } from '../interfaces/cart/cart-payload.interface';
import { Cart } from '../interfaces/cart/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(
    private http: HttpClient,
  ) { }

  /*
  * Get the current user's cart
   * @returns An Observable that emits the cart
   */
  getCart(): Observable<Cart> {
    return this.http.get<any>(`${environment.apiUrl}/v1/orders/current`);
  }

  /*
   * Purchase the current user's cart
   * @returns An Observable that emits the purchase response
   */
  purchaseCart(cartId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/orders/${cartId}/payment`);
  }

  /*
   * Add items to the current user's cart
   * @param cartItems An array of CartPayload objects representing the items to add
   * @param cartId The ID of the cart to update
   * @returns An Observable that emits void
   */
  addToCart(cartItems: CartPayload[], cartId: number): Observable<void> {
    const body = cartItems.map(cartItem => ({
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
    }));

    return this.http.post<void>(`${environment.apiUrl}/v1/orders/${cartId}/items`, body);
  }

  /*
   * Remove items from the current user's cart
   * @param cartItems An array of CartPayload objects representing the items to remove
   * @param cartId The ID of the cart to update
   * @returns An Observable that emits void
   */
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
