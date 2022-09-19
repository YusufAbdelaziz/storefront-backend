# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

### Token

- Token must be added as authorization header not inside the body.
- It should follow this format `authorization: Bearer <token>`.

### Products

- Index
  - `GET /products`
- Show
  - `GET /products/:id`
- Create [token required]

  - `POST /products`
  - | Body Property | Type                     |
    | ------------- | ------------------------ |
    | name          | **String**               |
    | price         | **Number** bigger than 0 |
    | category      | **String**               |

### Users

- Index [token required]
  - `GET /users`
- Show [token required]
  - `GET /users/:id`
- Create

  - `POST /users`
  - | Body Property | Type                                              |
    | ------------- | ------------------------------------------------- |
    | firstName     | **String** with a length of at least 5 characters |
    | lastName      | **String** with a length of at least 5 characters |
    | password      | **String** with a length of at least 8 characters |

- Authentication

  - `GET /users/auth`
  - | Body Property | Type                                              |
    | ------------- | ------------------------------------------------- |
    | firstName     | **String** with a length of at least 5 characters |
    | lastName      | **String** with a length of at least 5 characters |
    | password      | **String** with a length of at least 8 characters |

### Orders

- Current Order by user [args: user id](token required)
  - `GET /orders-by-user/:id`
- Add an order to a user(token required)
  - `POST /orders`
  - | Body Property | Type                                                                                            |
    | ------------- | ----------------------------------------------------------------------------------------------- |
    | status        | Should be either `complete` or `pending`                                                        |
    | products      | A list of product objects each contains `qty` and `id` properties and the product id must exist |
    | password      | String with a length of at least 8 characters                                                   |
- Add a product to an existing order.
  - `POST /orders/products`
  - | Body Property | Type                                                        |
    | ------------- | ----------------------------------------------------------- |
    | productId     | **Number** The product id must exist and previously created |
    | orderId       | **Number** The order id must exist and previously created   |
    | productQty    | **Number** The quantity of the product in the order         |

## Data Shapes

### Product

- id
- name
- price
- category

### User

- id
- firstName
- lastName
- password

### Order

- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (pending or complete)

### OrdersProducts
 - id
 - productId
 - orderId
 - qty

## Database Schema

- `users` table

  - | Column    | Type         |
    | --------- | ------------ |
    | id        | Serial PK    |
    | firstName | VARCHAR(200) |
    | lastName  | VARCHAR(200) |
    | password  | VARCHAR(200) |

- `products` table
  - | Column   | Type                  |
    | -------- | --------------------- |
    | id       | Serial PK             |
    | name     | VARCHAR(100) NOT NULL |
    | price    | INTEGER NOT NULL      |
    | category | VARCHAR(50)           |
- `orders` table
  - | Column  | Type                              |
    | ------- | --------------------------------- |
    | id      | Serial PK                         |
    | user_id | bigint FK references users.id     |
    | status  | orders_status (complete, pending) |
- `orders_products` table
  - | Column     | Type                             |
    | ---------- | -------------------------------- |
    | id         | Serial PK                        |
    | order_id   | bigint FK references orders.id   |
    | product_id | bigint FK references products.id |
    | qty        | integer                          |
