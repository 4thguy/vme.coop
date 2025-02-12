import { CommonModule } from '@angular/common';
import { Component, KeyValueDiffers, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { forkJoin, Subscription } from 'rxjs';
import { Cart } from '../../interfaces/cart.interface';
import { Product } from '../../interfaces/product.interface';
import { LocalstorageService } from '../../services/localstorage.service';
import { ProductsService } from '../../services/products.service';


@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['img', 'name', 'price', 'quantity', 'subtotal', 'actions'];

  cart: Cart = {};
  products: Product[] = [];

  loading = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductsService,
    private localStorageService: LocalstorageService,

    private differs: KeyValueDiffers,
  ) {
  }

  ngOnInit(): void {
    this.cart = this.localStorageService.getCart();
    this.fetch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetch(): void {
    const fork = Object.keys(this.cart).map(key => {
      return this.productService.getProductById(key);
    });
    this.subscriptions.add(forkJoin(fork)
      .subscribe(
        (products: Product[]) => this.products = products,
        error => console.error(error),
        () => {
          this.loading = false;
        }
      )
    );
  }

  updateItem(product: Product, qty: number): void {
    if (qty > 0) {
      this.localStorageService.addToCart(product, qty);
      this.cart = this.localStorageService.getCart();
    } else {
      this.removeItem(product);
    }
  }

  removeItem(product: Product): void {
    this.localStorageService.removeFromCart(product);
    this.cart = this.localStorageService.getCart();
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === product.id) {
        this.products.splice(i, 1);
        break;
      }
    }
  }

  buyNow(): void {
    // Implement the logic to buy now
  }

  subtotal(product: Product): number {
    return product.price * this.cart[product.id].qty;
  }

  total(): number {
    return this.products.reduce((total, product) => total + this.subtotal(product), 0);
  }
}
