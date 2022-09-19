import Client from "../databases";

export type Product = {
  id?: number;
  name: string;
  price: number;
  category: string;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM products";
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (e) {
      throw new Error(`An error occurred ${e}`);
    }
  }
  async show(productId: number): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM products WHERE id=($1)";
      const result = await conn.query(sql, [productId]);
      if (!result.rows.length) {
        throw new Error("Product associated with this id is not found");
      }
      conn.release();
      return result.rows[0];
    } catch (e) {
      throw e;
    }
  }
  async create(product: Product): Promise<Product> {
    try {
      const conn = await Client.connect();
      const existingProduct = await this.checkProductExistence(product);
      if (existingProduct) {
        throw new Error("Product already exists.");
      }
      const sql =
        "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [
        product.name,
        product.price,
        product.category,
      ]);
      conn.release();
      return result.rows[0];
    } catch (e) {
      throw e;
    }
  }
  private async checkProductExistence(product: Product): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql =
        "SELECT * FROM products WHERE name=($1) AND price=($2) AND category=($3)";
      const result = await conn.query(sql, [
        product.name,
        product.price,
        product.category,
      ]);
      conn.release();
      if (!result.rows.length) {
        return false;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
  async productExistById(productId: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM products WHERE id=($1)";
      const result = await conn.query(sql, [productId]);
      conn.release();
      if (!result.rows.length) {
        return false;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
  async resetTable(): Promise<void> {
    try {
      const conn = await Client.connect();
      const resetQuery = "TRUNCATE TABLE products RESTART IDENTITY CASCADE";
      await conn.query(resetQuery);
      conn.release();
    } catch (e) {
      throw e;
    }
  }
}
