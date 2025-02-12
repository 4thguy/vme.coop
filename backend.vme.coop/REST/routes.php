<?php
header("Content-Type: application/json");

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

// Require all API files and initialize their routes
function initializeRoutes($apiFiles)
{
    foreach ($apiFiles as $file) {
        require_once $file;
    }
}

// Main routing logic
$baseDir = __DIR__;
$apiFiles = findApiFiles($baseDir);
initializeRoutes($apiFiles);

// If no route matches, return a 404 error
http_response_code(404);
echo json_encode([
    "error" => "Not Found",
    "message" => "The requested endpoint does not exist.",
    "requested_route" => parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH),
    "method" => $_SERVER['REQUEST_METHOD'],
]);
?>