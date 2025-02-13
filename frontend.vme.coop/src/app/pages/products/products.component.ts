import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CartPayload } from '../../interfaces/cart/cart-payload.interface';
import { Cart } from '../../interfaces/cart/cart.interface';
import { Product } from '../../interfaces/product.interface';
import { Wrapper } from '../../interfaces/wrapper.interface';
import { OrderService } from '../../services/order.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatPaginatorModule,
    MatSelectModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('cardTitle') cardTitles!: QueryList<ElementRef>;
  @ViewChild('brandAuto') brandAuto: MatAutocomplete | undefined;

  products: Product[] = [];

  searchText: string = '';
  searchTextChanged: Subject<string> = new Subject<string>();

  brands: string[] = [];
  filteredBrands: string[] = [];
  brandSearch: string = '';
  selectedBrand: string = '';

  sortBy = [
    'Name',
    'Price',
  ];
  sortDirection = [
    'asc',
    'desc',
  ];
  selectedSort: string = '';

  qty: any = {};
  cart: Cart = {
    cart_id: -1,
    products: [],
  };

  page = 1;
  pageCount = 1;
  pageSize = 1;
  totalItems = 0;

  loading = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductsService,
    private orderService: OrderService,
  ) { }

  ngOnInit(): void {
    this.fetchCart();
    this.fetchProducts(1);
    this.subscriptions.add(this.searchTextChanged
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      ).subscribe((search: string) => {
        this.searchText = search;
      }));
    this.subscriptions.add(this.productService
      .getBrands()
      .subscribe((data: Wrapper<string>) => {
        this.brands = data.data;
        this.filteredBrands = [...this.brands];
      }));
  }

  ngAfterViewInit() {
    this.subscriptions.add(window.addEventListener('resize', () => this.setEqualHeight()));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  clearSearch(): void {
    this.searchText = '';
    this.fetchProducts(1);
  }

  clearBrand(): void {
    this.selectedBrand = '';
    this.brandSearch = '';
    this.filteredBrands = [...this.brands];
    this.brandAuto?.options.forEach(option => option.deselect());
    this.fetchProducts(1);
  }

  onPageChange(pageNumber: PageEvent): void {
    this.fetchProducts(pageNumber.pageIndex + 1);
  }

  onSearchTextChange(): void {
    this.fetchProducts(1);
  }

  onSelectBrand(brand: string): void {
    this.selectedBrand = brand;
    this.fetchProducts(1);
  }

  onSelectSort(sort: string): void {
    this.fetchProducts(1);
  }

  filterBrandOptions() {
    this.filteredBrands = this.brands.filter(brand =>
      brand.toLowerCase().includes(this.brandSearch.toLowerCase())
    );
  }

  fetchCart(): void {
    this.subscriptions.add(this.orderService.fetchCart()
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

  fetchProducts(pageNumber: number) {
    let sortParams = this.selectedSort.split('-');
    sortParams = sortParams.length === 2 ? sortParams : [];

    this.loading = true;
    this.subscriptions.add(
      this.productService.getProducts(pageNumber, this.searchText, this.brandSearch, ...sortParams)
        .subscribe(
          (products: Wrapper<Product>) => {
            this.page = products.page;
            this.pageCount = products.pages;
            this.pageSize = products.pageSize;
            this.totalItems = products.totalItems;
            this.products = products.data;
          },
          (error: any) => {
            console.error('Error fetching products:', error);
          },
          () => {
            this.loading = false;
            requestAnimationFrame(() => {
              this.setEqualHeight();
            })
          }
        )
    );
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
    this.subscriptions.add(this.orderService.addToCart([payload], this.cart.cart_id)
      .subscribe(
        () => {
          this.cart.products[product.id] = {
            ...product,
            quantity: qty,
          };
        },
        (error: any) => {
          console.error('Error adding to cart:', error);
        }
      ));
  }

  onRemoveFromCart(product: Product): void {
    this.subscriptions.add(this.orderService.removeFromCart([{ product_id: product.id, quantity: 0 }], 1)
      .subscribe(
        () => {
          delete this.cart.products[product.id];
          delete this.qty;
        },
        (error: any) => {
          console.error('Error removing from cart:', error);
        }
      ));
  }


  setEqualHeight() {
    let maxHeight = 0;

    // Reset heights first
    this.cardTitles.forEach(title => (title.nativeElement.style.height = 'auto'));

    requestAnimationFrame(() => {
      // Find the tallest one
      this.cardTitles.forEach(title => {
        let height = title.nativeElement.offsetHeight;
        if (height > maxHeight) {
          maxHeight = height;
        }
      });

      // Apply max height to all
      this.cardTitles.forEach(title => {
        title.nativeElement.style.height = maxHeight + 'px';
      });
    });
  }
}
