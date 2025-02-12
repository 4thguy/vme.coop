<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/POST.php';

use Illuminate\Database\Capsule\Manager as Capsule;

class GetOrderItemsAPI extends BasePOST
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

        $id = $this->params['id'];

        // here we should check if the user has permissions to access the order
        // the order has to belong to the user
        // or the user has to be part of a group that can access orders

        // here we are assuming that either one of these is true

        // Fetch Existing Order Items in Key-Value Format
        $order = Capsule::table('order_products')
            ->where('orders.id', $id)
            ->get(['product_id', 'quantity'])
            ->mapWithKeys(function ($item) {
                return [
                    $item->product_id => [
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                    ]
                ];
            })
            ->toArray();

        $order = $order ? $order : [];

        echo json_encode($order);
    }

}

$api = new GetOrderItemsAPI();
?>