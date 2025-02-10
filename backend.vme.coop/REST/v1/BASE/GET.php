<?php
require_once __DIR__ . '/BASE.php';

class BaseGET extends Base
{
    public function __construct($filePath)
    {
        parent::__construct($filePath, "GET");
    }

    public function parseQueryParams()
    {
        return $_GET;
    }
}
?>