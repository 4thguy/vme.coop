<?php
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Initialize Capsule (Eloquent ORM)
$capsule = new Capsule;

$capsule->addConnection([
    'driver' => $_ENV['DB_DRIVER'],
    'host' => $_ENV['DB_HOST'],
    'database' => $_ENV['DB_DATABASE'],
    'username' => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'charset' => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Check if the database is already initialized
$dbInitializedFile = '/var/www/html/.db_initialized';

if (!file_exists($dbInitializedFile)) {
    $files = glob('./sql/*.sql');

    if (empty($files)) {
        echo "No SQL files found\n";
        return;
    }

    foreach ($files as $file) {
        $sql = file_get_contents($file);
        try {
            Capsule::unprepared($sql);
        } catch (Exception $e) {
            echo "Error importing " . basename($file) . ": " . $e->getMessage() . "\n";
        }
    }

    // Create a file to mark the database as initialized
    file_put_contents($dbInitializedFile, "initialized");
}