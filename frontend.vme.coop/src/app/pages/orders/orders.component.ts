import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Order } from '../../interfaces/order.interface';
import { Wrapper } from '../../interfaces/wrapper.interface';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    RouterModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['id', 'updated_at', 'status', 'actions'];
  orders: Order[] = [];

  paymentLinks: any = {};

  page = 1;
  pageCount = 1;
  pageSize = 1;
  totalItems = 0;

  loading = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private orderService: OrderService,
  ) {
  }

  ngOnInit(): void {
    this.fetch(1);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onPageChange(pageNumber: PageEvent): void {
    this.fetch(pageNumber.pageIndex + 1);
  }

  fetch(pageNumber: number): void {
    this.subscriptions.add(this.orderService.getOrders(pageNumber)
      .subscribe(
        (orders: Wrapper<Order>) => {
          this.page = orders.page;
          this.pageCount = orders.pages;
          this.pageSize = orders.pageSize;
          this.totalItems = orders.totalItems;
          this.orders = orders.data;

          this.orders
            .filter((order: Order) => order.status === 'Awaiting Payment')
            .forEach((order: Order) => {
              this.subscriptions.add(this.orderService.purchaseCart(order.id)
                .subscribe((paymentLink: any) => {
                  this.paymentLinks[order.id] = paymentLink.payment_url;
                }));
            });
        },
        (error: any) => console.error(error),
        () => this.loading = false,
      ));
  }
}
