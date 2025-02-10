import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Product } from '../../interfaces/product.interface';
import { Wrapper } from '../../interfaces/wrapper.interface';
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
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('cardTitle') cardTitles!: QueryList<ElementRef>;

  products: Product[] = [];

  searchText: string = '';
  searchTextChanged: Subject<string> = new Subject<string>();

  brands: string[] = [];
  filteredBrands: string[] = [];
  brandSearch: string = '';
  selectedBrand: string = '';

  qty: any = {};

  page = 1;
  pageCount = 1;
  pageSize = 1;
  totalItems = 0;

  loading = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductsService,
  ) { }

  ngOnInit(): void {
    this.fetch(1);
    this.subscriptions.add(this.searchTextChanged.pipe(
      debounceTime(300),  // Wait 300ms after last keystroke
      distinctUntilChanged(), // Only trigger if value is different
    ).subscribe(value => {
      this.searchText = value;
    }));
    this.subscriptions.add(this.productService.getBrands()
      .subscribe((data: Wrapper<string[]>) => {
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
    this.fetch(1);
  }

  clearBrand(): void {
    this.selectedBrand = '';
    this.fetch(1);
  }

  onPageChange(pageNumber: PageEvent): void {
    this.fetch(pageNumber.pageIndex + 1);
  }

  onSearchTextChange(): void {
    this.fetch(1);
  }

  onSelectBrand(brand: string): void {
    this.selectedBrand = brand;
    this.fetch(1);
  }

  filterBrandOptions() {
    this.filteredBrands = this.brands.filter(brand =>
      brand.toLowerCase().includes(this.brandSearch.toLowerCase())
    );
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

  fetch(pageNumber: number) {
    this.loading = true
    this.subscriptions.add(
      this.productService.getProducts(pageNumber, this.searchText, this.brandSearch)
        .subscribe(
          (products: Wrapper<Product[]>) => {
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
}
