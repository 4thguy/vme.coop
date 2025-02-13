<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/REST/v1/BASE/GET.php';

class GetPaymentAPI extends BaseGET
{
    public function __construct()
    {
        parent::__construct(__FILE__);
    }

    public function handleRequest()
    {
        $stripeServer = $_ENV['STRIPE_SERVER'];
        if (!isset($stripeServer)) {
            throw new Exception("Stripe server not set");
        }

        $this->ensure_param('id');

        $orderId = $this->params['id'];

        $stripeUrl = $stripeServer . "?orderId=$orderId";

        echo json_encode([
            'payment_url' => $stripeUrl,
        ]);
    }
}

$api = new GetPaymentAPI();
?>