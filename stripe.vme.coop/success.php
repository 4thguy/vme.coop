<?php
require_once 'base.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Stripe\Checkout\Session as StripeCheckoutSession;

$orderId = $_GET['orderId'];
$sessionId = $_GET['sessionId'];
$checkoutSession = StripeCheckoutSession::retrieve($sessionId);

// Fetch the status ID for "Processing" in a single efficient query
$processingId = Capsule::table('order_status')
    ->where('status_name', 'Processing')
    ->value('id');

// Update order with JSON-encoded stripe response
Capsule::table('orders')
    ->where('id', $orderId)
    ->update([
        'stripe_response' => json_encode($checkoutSession, JSON_UNESCAPED_UNICODE), // Ensures proper encoding
        'status_id' => $processingId,
        'updated_at' => $timestamp,
    ]);

// Delete products from order_products table 
Capsule::table('order_products')
    ->where('order_id', $orderId)
    ->delete();

$redirectUrl = $_ENV['FRONTEND_SERVER'] . "/orders/$orderId";

header("HTTP/1.1 303 See Other");
header("Location: " . $redirectUrl);
?>