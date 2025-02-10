<?php
require 'db.php';

use Illuminate\Database\Capsule\Manager as DB;

try {
    $users = DB::select('SELECT NOW() as time');
    echo "Database connection successful! Server time: " . $users[0]->time;
} catch (Exception $e) {
    echo "Database connection failed: " . $e->getMessage();
}
?>
