<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/GET.php';

use Illuminate\Database\Capsule\Manager as Capsule;



class GetProductsAPI extends BaseGET
{

    static $pageSize = 16;

    public function __construct()
    {
        parent::__construct(__FILE__);
    }


    public function handleRequest()
    {
        $queryParams = $this->parseQueryParams();
        $page = isset($queryParams['page']) ? (int) $queryParams['page'] : 1;
        $search = isset($queryParams['search']) ? trim($queryParams['search']) : '';
        $brand = isset($queryParams['brand']) ? trim($queryParams['brand']) : '';

        $query = Capsule::table('products');

        if (!empty($search)) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        if (!empty($brand)) {
            $query->where('brand', $brand);
        }

        $totalItems = $query->count();
        $pages = ceil($totalItems / self::$pageSize);


        $products = $query
            ->orderBy('name', 'asc')
            ->skip(($page - 1) * self::$pageSize)
            ->take(self::$pageSize)
            ->get();

        echo json_encode([
            'pages' => $pages,
            'page' => $page,
            'pageSize' => self::$pageSize,
            'totalItems' => $totalItems,
            'data' => $products,
        ]);
    }

}

$api = new GetProductsAPI();
?>