# StripeVmeCoop

## Explanation of how the project is structured

The stripe project is structured as follows: 

 - environment config is in the `.env` file
 - `base.php` sets up the common functions
 - `index.php` reads the order from the cart using the given id and sends the user to stripe for payment processing with an itemized bill. It also updates the order in the database with the order summary and marks the order as `Awaiting Payment` 
 - `success.php` reads the stripe token and updates the order in the database and marks the order as `Processing`. Then it returns the user to the `frontend.vme.coop` on the `order/:id` page
 - `cancelled.php` Marks the order as `Pending`. Then it returns the user to the `frontend.vme.coop` on the `cart` page

 ## Technical Details

 - To avoid CORS complications, the server uses script tags to redirect the user from the browser instead of forwarding them from the server-side
 - I decided to use a separate server from the backend because this is a completely different function, and having them separate avoids complications
 - Having payment in progress disallows users from adding more items in the cart. The user has to cancel payment from Stripe to be able to add more items in the cart.

  ## Assumptions

  We are assuming that the user has permission to pay for the order. If someone wants to pay for someone else`s order, they can.

  ## Dependencies used

  - `illuminate/database` - An interface for database management to avoid injection attacks and writing SQL statements directly in the code
  - `vlucas/phpdotenv` - to read `.env` file configs
  - `stripe/stripe-php` - to initialize the stripe payment process

  ## Corners cut
  
  - I am not checking if this is the user`s cart. This allows for a scenario where a client is paying for someone else`s order. This means that the client can see what the other user is ordering.
  - Payment details from Stripe are stored with the order, so if such a scenario does occur, the order can be reprocessed and even refunded.
  - At no point in the process will the client see personal details like other user`s addresses as the backend only looks for orders belonging to the client and not for orders paid for by the client
  - This could be avoided by encoding the IDs throughout the project 