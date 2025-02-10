<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/POST.php';

class PostOrdersAPI extends BasePOST
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }
}

$api = new PostOrdersAPI();
?>