import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Order } from '../../interfaces/order.interface';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['name', 'price', 'quantity', 'subtotal'];

  order: Order | null = null;

  loading = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {
  }

  ngOnInit(): void {
    this.fetch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetch(): void {
    const orderId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.subscriptions.add(this.orderService.getOrder(orderId)
      .subscribe(
        (order: Order) => {
          this.order = order;
          order.order_contents = JSON.parse(order.order_contents || '[]');
        },
        (error: any) => console.error(error),
        () => this.loading = false,
      ));
  }

  subtotal(product: any): number {
    return product.quantity * product.price_data.unit_amount / 100;
  }

  total(): number {
    return this.order?.order_contents.reduce((total: number, product: any) => total + this.subtotal(product), 0);
  }
}
