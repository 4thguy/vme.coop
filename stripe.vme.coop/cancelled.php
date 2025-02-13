<?php
require_once 'base.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$orderId = $_GET['orderId'];

// Fetch the status ID for "Pending" in a single efficient query
$pendingId = Capsule::table('order_status')
    ->where('status_name', 'Pending')
    ->value('id');

// Update order with JSON-encoded line items and status in one query
Capsule::table('orders')
    ->where('id', $orderId)
    ->update([
        'order_contents' => null,
        'status_id' => $pendingId,
        'updated_at' => $timestamp,
    ]);

redirect_to_cart();
?>