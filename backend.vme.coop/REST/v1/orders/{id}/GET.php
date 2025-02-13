<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/POST.php';

use Illuminate\Database\Capsule\Manager as Capsule;

class GetOrderAPI extends BaseGet
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

        $order = Capsule::table('orders')
            ->join('order_status', 'orders.status_id', '=', 'order_status.id')
            ->select('orders.id', 'orders.order_contents', 'orders.updated_at', 'order_status.status_name as status')
            ->where('orders.id', $orderId)
            ->first();

        echo json_encode($order);

    }

}

$api = new GetOrderAPI();
?>