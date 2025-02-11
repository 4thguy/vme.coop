import { Injectable } from '@angular/core';
import { Cart } from '../interfaces/cart.interface';
import { CartItem } from '../interfaces/cartitem.interface';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  private static cartKey = 'cart';

  constructor() { }

  getCart(): Cart {
    return JSON.parse(localStorage.getItem(LocalstorageService.cartKey) || '{}') as Cart;
  }

  private setCart(cart: Cart): void {
    localStorage.setItem(LocalstorageService.cartKey, JSON.stringify(cart));
  }

  addToCart(item: Product, qty: number): void {
    const cart: Cart = this.getCart();
    cart[item.id] = {
      id: item.id,
      qty: qty,
    }
    this.setCart(cart);
  }

  removeFromCart(item: Product): void {
    const cart: Cart = this.getCart();
    delete cart[item.id];
    this.setCart(cart);
  }

  getItemFromCart(itemId: number): CartItem | null {
    const cart: Cart = this.getCart();
    return cart[itemId]
      ? cart[itemId]
      : null;
  }
}
