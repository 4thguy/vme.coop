<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/GET.php';

use Illuminate\Database\Capsule\Manager as Capsule;



class GetProductAPI extends BaseGET
{

    public function __construct()
    {
        parent::__construct(__FILE__);
    }


    public function handleRequest()
    {
        $queryParams = $this->parseQueryParams();
        $id = $queryParams['id'] ?? null;

        if (!$id) {
            $this->sendError(400, "id is missing");
            return;
        }

        $query = Capsule::table('products');

        $product = $query
            ->where("id", $id)
            ->first();

        if (!$product) {
            $this->sendError(404, "Product not found");
            return;
        }

        echo json_encode($product);
    }


}

$api = new GetProductAPI();
?>