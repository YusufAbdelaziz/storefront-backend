import Client from "../databases";

export enum Status {
  Complete = "complete",
  Pending = "pending",
}

export type Order = {
  id?: number;
  products?: { id: number; qty: number }[];
  userId: number;
  status: Status;
};

export class OrderStore {
  async indexByUserId(userId: number): Promise<Order[]> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM orders WHERE user_id=($1)";
      const ordersResult = await conn.query(sql, [userId]);
      let orders: Order[];
      if (ordersResult.rows) {
        orders = ordersResult.rows.map((row) => {
          const orderStatus = row.status as unknown as string;
          const order: Order = {
            status:
              orderStatus == "complete" ? Status.Complete : Status.Pending,
            userId: parseInt(row.user_id),
            id: row.id,
          };
          return order;
        });
        for (let order of orders) {
          const sql =
            "SELECT qty, product_id FROM orders_products WHERE order_id=($1)";
          const productsResult = await conn.query(sql, [order.id]);
          order.products = productsResult.rows.map((row) => {
            return { id: parseInt(row.product_id), qty: parseInt(row.qty) };
          });
        }
      } else {
        throw Error("No orders for this user");
      }
      conn.release();
      return orders;
    } catch (e) {
      throw e;
    }
  }

  async addProduct({
    productId,
    orderId,
    productQty,
  }: {
    productId: number;
    orderId: number;
    productQty: number;
  }): Promise<{
    id: number;
    orderId: number;
    productId: number;
    productQty: number;
  }> {
    try {
      const conn = await Client.connect();
      const sql =
        "INSERT INTO orders_products (order_id, product_id, qty) VALUES ($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [orderId, productId, productQty]);
      const orderProducts = result.rows[0];
      conn.release();
      return {
        id: orderProducts.id,
        orderId: parseInt(orderProducts.order_id),
        productId: parseInt(orderProducts.product_id),
        productQty: parseInt(orderProducts.qty),
      };
    } catch (e) {
      throw e;
    }
  }

  async addOrder(order: Order): Promise<Order> {
    try {
      const conn = await Client.connect();
      const orderInsertQuery =
        "INSERT INTO orders (user_id, status) VALUES ($1,$2) RETURNING *";
      const result = await conn.query(orderInsertQuery, [
        order.userId,
        order.status,
      ]);
      const newOrder = result.rows[0];
      if (order.products && order.products.length) {
        const promises: Promise<{
          id: number;
          orderId: number;
          productId: number;
          productQty: number;
        }>[] = order.products.map(
          async (product) =>
            await this.addProduct({
              orderId: newOrder.id as number,
              productId: product.id,
              productQty: product.qty,
            })
        );
        await Promise.all(promises);
      }
      conn.release();
      return { ...order, id: newOrder.id };
    } catch (e) {
      throw e;
    }
  }
  async orderExistById(orderId: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM orders WHERE id=($1)";
      const result = await conn.query(sql, [orderId]);
      conn.release();
      if (!result.rows.length) {
        return false;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
  async resetTables(): Promise<void> {
    try {
      const conn = await Client.connect();
      const resetOrdersProductsQuery =
        "TRUNCATE TABLE orders_products RESTART IDENTITY CASCADE";
      await conn.query(resetOrdersProductsQuery);
      const resetOrdersQuery =
        "TRUNCATE TABLE orders RESTART IDENTITY CASCADE ";
      await conn.query(resetOrdersQuery);
      conn.release();
    } catch (e) {
      throw e;
    }
  }
}
