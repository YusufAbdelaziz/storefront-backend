CREATE TABLE orders_products(
  order_id bigint REFERENCES orders(id),
  id SERIAL PRIMARY KEY,
  qty integer,
  product_id bigint REFERENCES products(id)
);