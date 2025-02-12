<?php
abstract class Base
{
    protected $route;
    protected $method;

    public function __construct($filePath, $method)
    {
        $this->method = strtoupper($method);
        $this->route = $this->detectRoute($filePath);
        $this->registerRoute();
    }

    private function detectRoute($filePath)
    {
        $relativePath = preg_replace("/^.*\/REST\//", "", $filePath);
        $route = str_replace([$this->method . ".php", "\\"], ["", "/"], $relativePath);
        return '/' . trim($route, '/'); // Normalize route
    }

    public function getRoute()
    {
        return $this->route;
    }

    private function registerRoute()
    {
        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        if ($requestUri === $this->route && $requestMethod === $this->method) {
            $this->handleRequest();
            exit;
        }
    }

    // This must be implemented by each HTTP method class

    public function handleRequest()
    {
        echo json_encode([
            "route" => $this->getRoute(),
            "method" => $this->method,
            "message" => "No response implemented."
        ]);
    }

    public function sendError($code, $message = "An error occurred.")
    {
        http_response_code($code);
        echo json_encode([
            "error" => $message
        ]);
    }
}
?>