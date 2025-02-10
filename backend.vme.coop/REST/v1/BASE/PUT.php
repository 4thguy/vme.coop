<?php
require_once __DIR__ . '/BASE.php';

class BasePUT extends Base
{
    public function __construct($filePath)
    {
        parent::__construct($filePath, "PUT");
    }
}
?>