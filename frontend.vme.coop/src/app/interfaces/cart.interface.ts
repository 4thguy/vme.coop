import { CartItem } from "./cartitem.interface";

export interface Cart {
  cart_id: number;
  cart: {
    [productId: string]: CartItem;
  }
}
