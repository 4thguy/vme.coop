<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/GET.php';

use Illuminate\Database\Capsule\Manager as Capsule;

class GetCurrentOrderAPI extends BaseGET
{
    private $pendingStatusId = -1;

    public function __construct()
    {
        parent::__construct(__FILE__);
    }

    public function setUp()
    {
        $pendingStatus = Capsule::table('order_status')
            ->where('status_name', 'Pending')
            ->first();
        if (!$pendingStatus) {
            return $this->sendError(500, "Internal server error.");
        }
        $this->pendingStatusId = $pendingStatus->id;
    }

    public function handleRequest()
    {
        $timestamp = date('Y-m-d H:i:s');

        $this->session_start();

        $this->ensure_user_logged_in();
        $userId = $_SESSION['user_id'];

        // here we should check if the user has permissions to access the order
        // the order has to belong to the user
        // or the user has to be part of a group that can access orders

        // here we are assuming that either one of these is true

        // Find an existing order for the user with 'Pending' status
        $order = Capsule::table('orders')
            ->where('status_id', '=', $this->pendingStatusId)
            ->where('user_id', '=', $userId)
            ->first();

        $orderId = $order
            ? $order->id
            : Capsule::table('orders')->insertGetId([
                'user_id' => $userId,
                'status_id' => $this->pendingStatusId,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

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

        // Return response as JSON
        echo json_encode([
            'cart_id' => $orderId,
            'products' => $cartItems,
        ]);
    }

}

$api = new GetCurrentOrderAPI();
?>