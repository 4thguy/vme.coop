<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/GET.php';

class GetProductsAPI extends BaseGET
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }
}

$api = new GetProductsAPI();
?>