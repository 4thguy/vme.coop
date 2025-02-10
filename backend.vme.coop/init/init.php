<?php
require 'db.php';

use Illuminate\Database\Capsule\Manager as DB;


// Check if tables exist before creating them
if (!Capsule::schema()->hasTable('products')) {
    Capsule::schema()->create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('barcode')->unique();
        $table->string('brand');
        $table->decimal('price', 10, 2);
        $table->string('image_url');
        $table->timestamps();
    });
    echo "Table 'products' created.\n";
} else {
    echo "Table 'products' already exists.\n";
}

if (!Capsule::schema()->hasTable('order_status')) {
    Capsule::schema()->create('order_status', function (Blueprint $table) {
        $table->id();
        $table->string('status_name')->unique();
        $table->timestamps();
    });
    echo "Table 'order_status' created.\n";
} else {
    echo "Table 'order_status' already exists.\n";
}

if (!Capsule::schema()->hasTable('orders')) {
    Capsule::schema()->create('orders', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('product_id');
        $table->integer('quantity');
        $table->unsignedBigInteger('status_id');
        $table->timestamps();

        // Foreign keys
        $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        $table->foreign('status_id')->references('id')->on('order_status')->onDelete('cascade');
    });
    echo "Table 'orders' created.\n";
} else {
    echo "Table 'orders' already exists.\n";
}

// Function to parse CSV and insert data
function importProducts($csvFile)
{
    if (!file_exists($csvFile)) {
        echo "Error: CSV file not found at $csvFile\n";
        return;
    }

    $file = fopen($csvFile, 'r');
    fgetcsv($file); // Skip header row

    while (($data = fgetcsv($file)) !== false) {
        // Convert date format from `d/m/Y H:i:s` to `Y-m-d H:i:s`
        $dateAdded = DateTime::createFromFormat('d/m/Y H:i:s', $data[5]);
        $formattedDate = $dateAdded ? $dateAdded->format('Y-m-d H:i:s') : null;

        // Check if product already exists by barcode
        $existingProduct = Capsule::table('products')->where('barcode', $data[1])->first();

        if (!$existingProduct) {
            Capsule::table('products')->insert([
                'name' => $data[0],
                'barcode' => $data[1],
                'brand' => $data[2],
                'price' => $data[3],
                'image_url' => $data[4],
                'created_at' => $formattedDate,
                'updated_at' =>` $formattedDate,
            ]);
            echo "Inserted product: {$data[0]}\n";
        } else {
            echo "Skipping duplicate product: {$data[0]}\n";
        }
    }

    fclose($file);
    echo "Product import complete!\n";
}

// Import products from CSV
$csvPath = __DIR__ . '/products.csv';
importProducts($csvPath);


?>