# BackendVmeCoop

## Explanation of how the project is structured

The back-end project is structured as follows: 

 - environment config is in the '.env' file
 - 'index.php' sets up some of the headers
 - 'db.php' sets up the database connection
 - all the code in the 'REST' folder handles REST calls

 ## REST

 - 'routes.php' scans all the sub-folders for the exposed routes
 - if a php file with a route method (GET, POST, DELETE) is found, it is added to the 'request_uri' index with the same path. So 'REST/v1/products/GET.php' can be accessed using GET 'example.org/v1/products'
 - special consideration is given to the '{id}' folder. The '{id}' in the route is replaced by the id of the object
 - the folder 'BASE' contains the base class of each request method. Each route file needs to inherit from the appropriate file in order for them to be added to the 'request_uri' index by 'routes.php'
 
 ## REST Routes

 - 'GET' 'v1/brands/' fetches a list of brands available in the shop
 - 'GET' 'v1/products/' fetches a paginated list of products available in the shop. This list can be filtered and sorted
 - 'GET' 'v1/products/{id}' fetches the product with that id
 - 'GET' 'v1/orders/' fetches a paginated list of orders for the current user
 - 'GET' 'v1/orders/current' fetches the shopping cart for the current user. It has a summary of the products with it so only one
 - 'GET' 'v1/orders/{id}' fetches the order with that id, and the stripe summary of the order
 - 'GET' 'v1/orders/{id}/items' fetches a detailed list of products in that order if and only if the order is 'Pending'
 - 'POST' 'v1/orders/{id}/items' adds products to that order if and only if the order is 'Pending'
 - 'DELETE' 'v1/orders/{id}/items' removes products from that order if and only if the order is 'Pending'
 - 'GET' 'v1/orders/{id}/payment' returns a payment link that will transfer the user over to 'stripe.vme.coop'

  ## Assumptions

  We are assuming that the user has logged in and is authenticated. Nevertheless, the backend only allows the user to access the cart and order data of user ID 1.

  ## Dependencies used

  - 'illuminate/database' - An interface for database management to avoid injection attacks and writing SQL statements directly in the code
  - 'vlucas/phpdotenv' - to read '.env' file configs

  ## Corners cut
  
  - 'GET' 'v1/orders/current' always fetches the order and a detailed list of products associated with it, regardless of whether the client may need the detail or not.
  - Once the payment process is started, adding new items in the cart is disallowed until the payment is cancelled from Stripe's side
  - PHP checks if DB is initialized every time 'db.php' is run
  - Database triggers could have been used to keep a log of transactions