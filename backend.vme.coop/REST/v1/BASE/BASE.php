<?php
abstract class Base
{
    protected $route;
    protected $method;
    protected $params = array();

    public function __construct($filePath, $method)
    {
        $this->method = strtoupper($method);
        $this->route = $this->detectRoute($filePath);
        $this->setUp();
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
        $requestUri = rtrim($requestUri, '/');
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        // Extract named keys from route (e.g., "/orders/{id}" -> ["id"])
        preg_match_all('/\{([^}]+)\}/', $this->route, $paramNames);
        $paramNames = $paramNames[1]; // Extract only the parameter names

        // Convert "{id}" to regex "([^/]+)" for matching
        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $this->route);
        $pattern = str_replace('/', '\/', $pattern);
        $pattern = '/^' . $pattern . '$/';

        if (preg_match($pattern, $requestUri, $matches) && $requestMethod === $this->method) {
            array_shift($matches); // Remove the full match

            // Assign matches to named keys
            $this->params = array_combine($paramNames, $matches);

            $this->handleRequest();
            exit;
        }
    }

    public function setUp()
    {
        // Initialize any necessary resources or configurations here
    }

    // This must be implemented by each HTTP method class
    public function handleRequest()
    {
        echo json_encode([
            "route" => $this->getRoute(),
            "method" => $this->method,
            "message" => "No response implemented.",
        ]);
    }

    public function sendMessage($code, $message)
    {
        http_response_code($code);
        echo json_encode([
            "status" => "success",
            "message" => $message,
        ]);
    }

    public function sendError($code, $message = "An error occurred.")
    {
        http_response_code($code);
        echo json_encode([
            "status" => "error",
            "message" => $message,
        ]);
    }

    protected function session_start()
    {
        // Ensure session is started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    protected function ensure_user_logged_in()
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            return $this->sendError(403, "User is not logged in");
        }
    }

    protected function ensure_param($paramName)
    {
        $params = $this->params[$paramName] ?? null;
        if (!$params) {
            return $this->sendError(400, $paramName . " is missing");
        }
    }
}
?>