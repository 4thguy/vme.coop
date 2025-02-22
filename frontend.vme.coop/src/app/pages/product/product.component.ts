import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartPayload } from '../../interfaces/cart/cart-payload.interface';
import { Cart } from '../../interfaces/cart/cart.interface';
import { Product } from '../../interfaces/product.interface';
import { CartService } from '../../services/cart.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, OnDestroy {

  product: Product | null = null;

  qty: any = {};
  cart: Cart = {
    cart_id: -1,
    products: [],
  };

  loading = true;
  error = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductsService,
  ) {
  }

  ngOnInit(): void {
    this.fetchCart();
    this.fetchProduct();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchCart(): void {
    this.subscriptions.add(this.cartService.getCart()
      .subscribe(
        (cart: Cart) => {
          this.cart = cart;
          this.qty = Object.values(cart.products)
            .reduce((acc, item) => {
              acc[item.id] = item.quantity;
              return acc;
            }, {} as Record<string, number>);
        },
        (error: any) => console.error(error),
      ));
  }

  fetchProduct(): void {
    this.loading = true;
    this.error = false;
    const productId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.subscriptions.add(this.productService.getProductById(productId)
      .subscribe(
        (product: Product) => {
          this.product = product;
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          this.error = true;
          console.error('Error fetching product:', error);
        },
      ));
  }

  calculatePrice(product: Product): number {
    return parseFloat(product.price.toString()) * (this.qty[product.id] || 1);
  }

  isAdd(product: Product): boolean {
    return !this.qty[product.id];
  }

  onAddToCart(product: Product): void {
    const qty = this.qty[product.id] || 1;
    const payload: CartPayload = { product_id: product.id, quantity: qty };
    this.subscriptions.add(this.cartService.addToCart([payload], this.cart.cart_id)
      .subscribe(
        () => {
          this.qty[product.id] = qty;
        },
        (error: any) => {
          console.error('Error adding to cart:', error);
        }
      ));
  }

  onRemoveFromCart(product: Product): void {
    this.subscriptions.add(this.cartService.removeFromCart([{ product_id: product.id, quantity: 0 }], this.cart.cart_id)
      .subscribe(
        () => {
          delete this.cart.products[product.id];
          this.qty[product.id] = 0;
        },
        (error: any) => {
          console.error('Error removing from cart:', error);
        }
      ));
  }

}
