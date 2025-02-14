# FrontendVmeCoop

## Explanation of how the project is structured

The front-end project is structured as follows: 

 - 'services' contains the services needed to interact with the backend.
 - 'pages' contains the pages that make up the application.
 - 'interfaces' contains the interfaces for the services and pages to help with type checking.

 ## Services
 There are 3 services present in the project:

  - 'CartService' - Handles interactions with the cart API and purchase redirection.
  - 'OrdersService' - Handles interactions with the orders API.
  - 'ProductsService' - Handles interactions with the products API.

 ## Pages
 
 There are 5 pages present in the project:

  - 'Home' - Hi :)
  - 'Products' - Lists the products available for purchase, allows the user to add them to cart
  - 'Cart' - Shopping cart, allows updating of quantity or removing items from cart
  - 'Orders' - Lists all orders made by the user. User can view more details or pay for pending orders
  - 'Order/:id' - Details of a specific order

  ## Assumptions

  We are assuming that the user has logged in and is authenticated. Nevertheless, the backend only allows the user to access the cart and order data of user ID 1.

  ## Dependencies used

  - 'Bootstrap' - A front-end framework for building responsive websites. Used for the navbar and the container element.
  - 'Angular' - A JavaScript framework for building dynamic web applications. Used for the routing, components, and services.
  - 'Angular Material' - A set of pre-built UI components for Angular applications. Used for the buttons, cards, and other elements in the application.

  ## Corners cut
  
  - The Angular Application is not split into modules, so all the dependencies have to be loaded before the application boots instead of loading everything as needed.


