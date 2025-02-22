<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/POST.php';

use Illuminate\Database\Capsule\Manager as Capsule;

class GetOrderItemsAPI extends BaseGet
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }

    public function handleRequest()
    {
        $this->session_start();

        $this->ensure_user_logged_in();

        $this->ensure_param('id');

        $orderId = $this->params['id'];

        // here we should check if the user has permissions to access the order
        // the order has to belong to the user
        // or the user has to be part of a group that can access orders

        // here we are assuming that either one of these is true

        // Fetch Existing Order Items in Key-Value Format
        $order = Capsule::table('order_products')
            ->where('order_id', $orderId)
            ->pluck('quantity', 'product_id')
            ->toArray();

        $cartItems = Capsule::table('products')
            ->whereIn('id', array_keys($order))
            ->get()
            ->map(function ($product) use ($order) {
                $productArray = (array) $product;
                $productArray['quantity'] = $order[$product->id];
                return $productArray;
            })
            ->values()
            ->toArray();

        echo json_encode($cartItems);

    }

}

$api = new GetOrderItemsAPI();
?>