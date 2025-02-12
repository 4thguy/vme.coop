import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Cart } from '../../interfaces/cart.interface';
import { Product } from '../../interfaces/product.interface';
import { OrderService } from '../../services/order.service';
import { ProductsService } from '../../services/products.service';

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
    cart: {},
  };
  products: Product[] = [];

  loading = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductsService,
    private orderService: OrderService,
  ) {
  }

  ngOnInit(): void {
    this.fetchCart();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchCart(): void {
    this.subscriptions.add(this.orderService.fetchCart()
      .subscribe(
        (cart: Cart) => {
          this.cart = cart;
          this.fetchProducts();
        },
        (error: any) => console.error(error),
        () => this.loading = false,
      ));
  }

  fetchProducts(): void {
    const fork = Object.keys(this.cart.cart).map(key => {
      return this.productService.getProductById(key);
    });
    this.subscriptions.add(forkJoin(fork)
      .subscribe(
        (products: Product[]) => this.products = products,
        (error: any) => console.error(error),
        () => this.loading = false,
      )
    );
  }

  updateItem(product: Product): void {
    this.loading = true;
    const qty = this.cart.cart[product.id].quantity || 0;
    if (qty > 0) {
      this.subscriptions.add(this.orderService.addToCart([{ product_id: product.id, quantity: qty }], this.cart.cart_id)
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
        )
        .subscribe(
          () => {
            this.cart.cart[product.id].quantity = qty;
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

  removeItem(product: Product): void {
    this.loading = true;
    this.subscriptions.add(this.orderService.removeFromCart([{ product_id: product.id, quantity: 0 }], this.cart.cart_id)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(
        (order: any) => {
          delete this.cart.cart[product.id];
          for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].id === product.id) {
              this.products.splice(i, 1);
              break;
            }
          }
        },
        (error: any) => console.error(error),
        () => this.loading = false,
      ));
  }

  buyNow(): void {
    // this.loading = true;
    // this.subscriptions.add(this.orderService.addToCart(Object.values(this.cart.cart), this.cart.cart_id)
    //   .pipe(
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //   )
    //   .subscribe(
    //     (order: any) => {
    //       console.log('Order added to order list:', order);
    //     },
    //     (error: any) => console.error(error),
    //     () => this.loading = false,
    //   ));
  }

  subtotal(product: Product): number {
    return product.price * this.cart.cart[product.id].quantity;
  }

  total(): number {
    return this.products.reduce((total, product) => total + this.subtotal(product), 0);
  }
}
