<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/GET.php';

use Illuminate\Database\Capsule\Manager as Capsule;



class GetBrandsAPI extends BaseGET
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }


    public function handleRequest()
    {
        $query = Capsule::table('products');

        $brands = $query
            ->select('brand')
            ->distinct()
            ->pluck('brand')
            ->toArray();

        sort($brands);

        echo json_encode([
            'pages' => 1,
            'page' => 1,
            'pageSize' => 1,
            'totalItems' => count($brands),
            'data' => $brands,
        ]);
    }

}

$api = new GetBrandsAPI();
?>