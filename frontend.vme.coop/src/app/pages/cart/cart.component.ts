import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CartItem } from '../../interfaces/cart/cart-item.interface';
import { Cart } from '../../interfaces/cart/cart.interface';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['img', 'name', 'price', 'quantity', 'subtotal', 'actions'];

  cart: Cart = {
    cart_id: 0,
    products: [],
  };

  loading = true;
  error = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
  ) {
  }

  ngOnInit(): void {
    this.fetch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetch(): void {
    this.loading = true;
    this.error = false;
    this.subscriptions.add(this.cartService.getCart()
      .subscribe(
        (cart: Cart) => {
          this.cart = cart;
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          this.error = true;
          console.error('Error fetching cart:', error);
        },
      ));
  }

  updateItem(product: CartItem): void {
    this.loading = true;
    const qty = product.quantity || 0;
    if (qty > 0) {
      this.subscriptions.add(this.cartService.addToCart([{ product_id: product.id, quantity: qty }], this.cart.cart_id)
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
        )
        .subscribe(
          () => {
            product.quantity = qty;
          },
          (error: any) => {
            console.error('Error adding to cart:', error);
          },
          () => this.loading = false,
        ));
    } else {
      this.removeItem(product);
    }
  }

  removeItem(product: CartItem): void {
    this.loading = true;
    this.subscriptions.add(this.cartService.removeFromCart([{ product_id: product.id, quantity: 0 }], this.cart.cart_id)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(
        (order: any) => {
          for (let i = 0; i < this.cart.products.length; i++) {
            if (this.cart.products[i].id === product.id) {
              this.cart.products.splice(i, 1);
              break;
            }
          }
        },
        (error: any) => console.error(error),
        () => this.loading = false,
      ));
  }

  buyNow(): void {
    this.loading = true;
    this.subscriptions.add(this.cartService.purchaseCart(this.cart.cart_id)
      .subscribe(
        (order: any) => {
          window.location = order.payment_url;
        },
        (error: any) => {
          console.error(error);
          this.loading = false;
        },
      ));
  }

  subtotal(product: CartItem): number {
    return product.price * product.quantity;
  }

  total(): number {
    return this.cart.products.reduce((total, product) => total + this.subtotal(product), 0);
  }
}
