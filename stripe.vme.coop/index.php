<?php
require_once 'base.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Stripe\Checkout\Session as StripeCheckoutSession;

$orderId = $_GET['orderId'];
if (!isset($orderId)) {
    redirect_to_cart();
}

$orderStatus = Capsule::table('orders')
    ->where('id', $orderId)
    ->value('status_id');
if (!isset($orderStatus)) {
    redirect_to_cart();
}

// Fetch the status ID for "Awaiting Payment" in a single efficient query
$pendingId = Capsule::table('order_status')
    ->where('status_name', 'Pending')
    ->value('id');

// Fetch the status ID for "Awaiting Payment" in a single efficient query
$awaitingPaymentId = Capsule::table('order_status')
    ->where('status_name', 'Awaiting Payment')
    ->value('id');

if ($orderStatus != $pendingId && $orderStatus != $awaitingPaymentId) {
    redirect_to_cart();
}

// Fetch order items with product details and format them for Stripe in one query
$lineItems = Capsule::table('order_products')
    ->join('products', 'order_products.product_id', '=', 'products.id')
    ->where('order_products.order_id', $orderId)
    ->select('products.name', 'products.price', 'order_products.quantity')
    ->get()
    ->map(fn($item) => [
        'price_data' => [
            'currency' => 'eur',
            'product_data' => ['name' => $item->name],
            'unit_amount' => (int) ($item->price * 100), // Convert to cents and ensure it's an integer
        ],
        'quantity' => (int) $item->quantity,
    ])
    ->toArray();

// Update order with JSON-encoded line items and new order status
Capsule::table('orders')
    ->where('id', $orderId)
    ->update([
        'order_contents' => json_encode($lineItems, JSON_UNESCAPED_UNICODE), // Ensures proper encoding
        'status_id' => $awaitingPaymentId,
        'updated_at' => $timestamp,
    ]);

// Create Stripe Checkout Session
$checkoutSession = StripeCheckoutSession::create([
    'success_url' => "http://" . $_SERVER['HTTP_HOST'] . "/success.php?orderId=$orderId&sessionId={CHECKOUT_SESSION_ID}",
    'cancel_url' => "http://" . $_SERVER['HTTP_HOST'] . "/cancelled.php?orderId=$orderId",
    'mode' => 'payment',
    'line_items' => $lineItems,
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $checkoutSession->url);
?>