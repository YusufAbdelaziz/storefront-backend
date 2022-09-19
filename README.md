# Overview

[![wakatime](https://wakatime.com/badge/user/2009fdf2-8d6f-4d87-9435-7ec784a9054f/project/2c653654-92ca-4705-ac82-8fcc67f31e10.svg)](https://wakatime.com/badge/user/2009fdf2-8d6f-4d87-9435-7ec784a9054f/project/2c653654-92ca-4705-ac82-8fcc67f31e10)

This project is the backend of a Storefront application.

## Features

- User authentication and authorization via JWT.
- Create orders for each user.
- Create products and add products to any order.
- View users, orders, and products.

</br>

## Setup

### App setup

- To install the necessary packages, run the following command in the prompt
  - `npm install`

### Database Setup

- Make sure to install PostgreSQL from [here][1] and type `psql` in the command line to check if PostgreSQL was installed correctly.
- Start `psql` prompt by typing `psql -U postgres`.
- You have to create two databases, one for development and the other for testing.
  - `CREATE DATABASE storefront_dev;`
  - `CREATE DATABASE storefront_test;`
  - The PostgreSQL server would run on `127.0.0.0:5432`

### Environment Variables

```
POSTGRES_HOST=127.0.0.1
POSTGRES_DB=storefront_dev
POSTGRES_DB_TEST=storefront_test
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1234
ENV=dev
TOKEN_SECRET=never-gonna-give-you-up
BCRYPT_PASSWORD=never-gonna-let-you-down
SALT_ROUNDS=10
```

</br>

## Scripts

| Command         | Functionality                          |
| --------------- | -------------------------------------- |
| `npm run watch` | Runs the app on address `0.0.0.0:3000` |
| `npm run test`  | Runs all test suites.                  |

</br>

## Ports
 - The backend is running on port **3000**.
 - PostgreSQL server is running on port **5432**.

## Postman

You can press on the button below to directly to use the collection that consumes the APIs in the app.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/a004ff1e8d7a895129d0?action=collection%2Fimport)

[1]: https://www.postgresql.org/download/
