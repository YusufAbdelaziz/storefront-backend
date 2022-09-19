CREATE TYPE order_status AS ENUM ('complete', 'pending');

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id bigint REFERENCES users(id),
  status order_status
);