<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/GET.php';

use Illuminate\Database\Capsule\Manager as Capsule;

class GetOrdersAPI extends BaseGET
{

    static $pageSize = 16;

    public function __construct()
    {
        parent::__construct(__FILE__);
    }

    public function handleRequest()
    {
        $this->session_start();

        $this->ensure_user_logged_in();
        $id = $_SESSION['user_id'];

        $queryParams = $this->parseQueryParams();
        $page = isset($queryParams['page']) ? (int) $queryParams['page'] : 1;

        // Get all orders for the user
        $query = Capsule::table('orders')
            ->join('order_status', 'orders.status_id', '=', 'order_status.id')
            ->where('orders.user_id', $id);

        $totalItems = $query->count();
        $pages = ceil($totalItems / self::$pageSize);

        $orders = $query
            ->orderBy('updated_at', 'desc')
            ->select('orders.id', 'orders.updated_at', 'order_status.status_name as status')
            ->skip(($page - 1) * self::$pageSize)
            ->take(self::$pageSize)
            ->get();

        echo json_encode([
            'pages' => $pages,
            'page' => $page,
            'pageSize' => self::$pageSize,
            'totalItems' => $totalItems,
            'data' => $orders,
        ]);
    }
}

$api = new GetOrdersAPI();
?>