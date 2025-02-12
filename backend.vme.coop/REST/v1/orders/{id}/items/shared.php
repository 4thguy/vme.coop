<?php
use Illuminate\Database\Capsule\Manager as Capsule;

function extract_post_body()
{
    // Read and Decode JSON Input
    $postBody = json_decode(file_get_contents('php://input'), true);
    if (!is_array($postBody) || empty($postBody)) {
        return false;
    }
    return $postBody;
}
function verify_is_pending($id)
{
    return Capsule::table('orders')
        ->join('order_status', 'orders.status_id', '=', 'order_status.id')
        ->where('orders.id', $id)
        ->where('order_status.status_name', 'Pending')
        ->exists();
}
function verify_all_products_exist_in_database($postBody)
{
    $productIds = array_column($postBody, 'product_id');
    $existingProductIds = Capsule::table('products')
        ->whereIn('id', $productIds)
        ->pluck('id')
        ->toArray();

    // Ensure all provided product IDs exist in the database
    foreach ($productIds as $productId) {
        if (!in_array($productId, $existingProductIds, true)) {
            return false;
        }
    }

    return $productIds;
}
?>