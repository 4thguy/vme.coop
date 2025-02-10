<?php
header("Content-Type: application/json");

$baseDir = __DIR__;
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Function to scan all API files (e.g., GET.php, POST.php, etc.)
function findApiFiles($dir)
{
    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));

    foreach ($iterator as $file) {
        if ($file->isFile() && preg_match('/\b(GET|POST|PUT|DELETE|PATCH)\.php$/', $file->getFilename())) {
            if (strpos($file->getPathname(), "/BASE/") === false) { // Completely ignore _BASE/
                $files[] = $file->getPathname();
            }
        }
    }

    return $files;
}

// Find all API files
$apiFiles = findApiFiles($baseDir);
$registeredRoutes = [];

// Require all API files and collect valid routes
foreach ($apiFiles as $file) {
    require_once $file; // Load each API file
    $relativePath = preg_replace("/^.*\/REST\//", "", $file); // Remove REST root
    $route = str_replace(["GET.php", "POST.php", "PUT.php", "DELETE.php", "PATCH.php"], "", $relativePath);
    $route = '/' . trim($route, '/'); // Normalize slashes

    // Store the valid route and method
    $method = strtoupper(pathinfo($file, PATHINFO_FILENAME)); // Extract method (GET, POST, etc.)
    $registeredRoutes[$route] = $method;
}

// **404 FALLBACK**: If no valid route matches the request, return an error
if (!array_key_exists($requestUri, $registeredRoutes) || $requestMethod !== $registeredRoutes[$requestUri]) {
    http_response_code(404);
    echo json_encode([
        "error" => "Not Found",
        "message" => "The requested endpoint does not exist.",
        "requested_route" => $requestUri,
        "method" => $requestMethod,
        "available_routes" => array_keys($registeredRoutes) // List available routes
    ]);
    exit;
}
?>