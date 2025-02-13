<?php
require_once 'vendor/autoload.php';

use Stripe\Stripe;
use Illuminate\Database\Capsule\Manager as Capsule;

$timestamp = date('Y-m-d H:i:s');

$dotenv = Dotenv\Dotenv::createImmutable('./');
$dotenv->load();

Stripe::setAppInfo(
    "test.vme.coop",
    "0.0.1",
    "http://" . $_SERVER['HTTP_HOST'],
);
Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

// Initialize Capsule (Eloquent ORM)
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

function redirect_to_cart()
{
    $redirectUrl = $_ENV['FRONTEND_SERVER'] . "/cart";

    header("HTTP/1.1 303 See Other");
    header("Location: " . $redirectUrl);
}

?>