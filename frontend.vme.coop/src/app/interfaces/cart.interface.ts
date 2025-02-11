import { CartItem } from "./cartitem.interface";

export interface Cart {
  [productId: string]: CartItem;
}
