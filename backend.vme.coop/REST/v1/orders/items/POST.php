<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/POST.php';

class PostDeleteOrderItemsAPI extends BasePOST
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }
}

$api = new PostDeleteOrderItemsAPI();
?>