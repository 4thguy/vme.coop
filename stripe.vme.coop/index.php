<?php
require_once 'vendor/autoload.php';

$orderId = $_GET['orderId'];
if (!isset($orderId)) {
    die("Order ID not provided");
}

$dotenv = Dotenv\Dotenv::createImmutable('./');
$dotenv->load();

use Stripe\Stripe;
use Stripe\Checkout\Session as StripeCheckoutSession;
Stripe::setAppInfo(
    "test.vme.coop",
    "0.0.1",
    "http://" . $_SERVER['HTTP_HOST'],
);
Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);


// Initialize Capsule (Eloquent ORM)
use Illuminate\Database\Capsule\Manager as Capsule;
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => $_ENV['DB_DRIVER'],
    'host' => $_ENV['DB_HOST'],
    'database' => $_ENV['DB_DATABASE'],
    'username' => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'charset' => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix' => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Fetch order items with product details
$lineItems = Capsule::table('order_products')
    ->join('products', 'order_products.product_id', '=', 'products.id')
    ->where('order_products.order_id', $orderId)
    ->get(['products.id', 'products.name', 'products.price', 'order_products.quantity'])
    ->map(function ($item) {
        return [
            'price_data' => [
                'currency' => 'eur',
                'product_data' => [
                    'name' => $item->name,
                ],
                'unit_amount' => $item->price * 100, // Stripe expects amount in cents
            ],
            'quantity' => $item->quantity,
        ];
    })
    ->toArray();

// Create Stripe Checkout Session
$checkout_session = StripeCheckoutSession::create([
    'success_url' => "http://" . $_SERVER['HTTP_HOST'] . '/success.php?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url' => "http://" . $_SERVER['HTTP_HOST'] . '/canceled.php',
    'mode' => 'payment',
    'line_items' => $lineItems,
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $checkout_session->url);

?>