<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/POST.php';
require_once 'shared.php';

use Illuminate\Database\Capsule\Manager as Capsule;

class PostOrderItemsAPI extends BasePOST
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }

    public function handleRequest()
    {
        $timestamp = date('Y-m-d H:i:s');

        $this->session_start();

        $this->ensure_user_logged_in();

        $this->ensure_param('id');

        $id = $this->params['id'];

        // here we should check if the user has permissions to access the order
        // the order has to belong to the user
        // or the user has to be part of a group that can access orders

        // here we are assuming that either one of these is true

        // Read and Decode JSON Input
        $postBody = extract_post_body();
        if (!$postBody) {
            return $this->sendError(400, "Invalid request body");
        }

        $this->validate_product_data($postBody);

        // Check if Order is 'Pending'
        $isPending = verify_is_pending($id);
        if (!$isPending) {
            return $this->sendError(403, "Order cannot be modified.");
        }

        // Check if Product IDs are valid
        $productIds = verify_all_products_exist_in_database($postBody);
        if (!$productIds) {
            return $this->sendError(400, "Invalid product ID");
        }

        // Prepare Data for Upsert
        $formattedData = array_map(fn($value) => [
            'order_id' => (int) $id,
            'product_id' => (int) $value['product_id'],
            'quantity' => (int) $value['quantity'],
        ], $postBody);


        try {
            Capsule::beginTransaction();

            // Upsert Order Products
            Capsule::table('order_products')->upsert(
                $formattedData,
                ['order_id', 'product_id'], // Unique key columns
                ['quantity'] // Columns to update if conflict occurs
            );

            Capsule::table('orders')
                ->where('id', $id)
                ->update(['updated_at' => $timestamp]);

            Capsule::commit();

            $this->sendMessage(200, "Order products updated successfully.");
        } catch (\Exception $e) {
            Capsule::rollBack();
            error_log($e->getMessage());
            return $this->sendError(500, "An internal error occurred.");
        }
    }

    private function validate_product_data($postBody)
    {
        foreach ($postBody as $value) {
            if (
                !isset($value['product_id'], $value['quantity']) ||
                !is_numeric($value['product_id']) ||
                !is_numeric($value['quantity']) ||
                $value['product_id'] <= 0 ||
                $value['quantity'] <= 0
            ) {
                return $this->sendError(400, "Invalid request body");
            }
        }
        return true;
    }

}

$api = new PostOrderItemsAPI();
?>