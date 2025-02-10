<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/DELETE.php';

class DeleteOrderItemsAPI extends BaseDELETE
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }
}

$api = new DeleteOrderItemsAPI();
?>