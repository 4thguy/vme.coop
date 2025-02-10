<?php
require_once __DIR__ . '/BASE.php';

class BaseDELETE extends Base
{
    public function __construct($filePath)
    {
        parent::__construct($filePath, "DELETE");
    }
}
?>