import { CartItem } from "./cart-item.interface";

export interface Cart {
  cart_id: number;
  products: CartItem[];
}
