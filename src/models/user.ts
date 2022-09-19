import bcrypt from "bcrypt";
import Client from "../databases";
import dotenv from "dotenv";

dotenv.config();

let saltRounds: number;
if (process.env.SALT_ROUNDS) {
  saltRounds = parseInt(process.env.SALT_ROUNDS as string);
}

export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  password?: string;
};

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT id, firstName, lastName FROM users";
      const result = await conn.query(sql);
      conn.release();
      return result.rows.map((row) => {
        return { firstName: row.firstname, lastName: row.lastname, id: row.id };
      });
    } catch (e) {
      throw e;
    }
  }
  async show(userId: number): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT id, firstName, lastName FROM users WHERE id=($1)";
      const result = await conn.query(sql, [userId]);
      if (!result.rows.length) {
        throw new Error("User associated with this id is not found");
      }
      conn.release();
      const row = result.rows[0];
      return { firstName: row.firstname, lastName: row.lastname, id: row.id };
    } catch (e) {
      throw e;
    }
  }
  async create(user: User): Promise<User> {
    try {
      const conn = await Client.connect();
      const userExist = await this.checkUserExistence(user);
      if (!user.password) throw new Error("password is empty !");
      const hashedPassword = bcrypt.hashSync(user.password, saltRounds);
      if (userExist) {
        throw new Error("A user exists with the same first name and last name");
      }
      const sql =
        "INSERT INTO users (firstName, lastName, password) VALUES ($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [
        user.firstName,
        user.lastName,
        hashedPassword,
      ]);
      const newUser = result.rows[0];
      conn.release();
      return {
        id: newUser.id,
        password: newUser.password,
        firstName: newUser.firstname,
        lastName: newUser.lastname,
      };
    } catch (e) {
      throw e;
    }
  }

  async authenticate(user: User): Promise<User | null> {
    try {
      const conn = await Client.connect();

      const sqlQuery =
        "SELECT * FROM users WHERE firstName=($1) AND lastName=($2)";
      const result = await conn.query(sqlQuery, [
        user.firstName,
        user.lastName,
      ]);

      if (!result.rows.length) {
        throw new Error("User is not found !");
      }
      const existingUser = result.rows[0];
      conn.release();
      if (!user.password) throw new Error("password is empty !");
      if (bcrypt.compareSync(user.password, existingUser.password)) {
        return {
          id: existingUser.id,
          password: existingUser.password,
          firstName: existingUser.firstname,
          lastName: existingUser.lastname,
        };
      }
      return null;
    } catch (e) {
      throw e;
    }
  }

  private async checkUserExistence(user: User): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM users WHERE firstName=($1) AND lastName=($2)";
      const result = await conn.query(sql, [user.firstName, user.lastName]);
      conn.release();
      if (!result.rows.length) {
        return false;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  async userExistById(userId: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = "SELECT * FROM users WHERE id=($1)";
      const result = await conn.query(sql, [userId]);
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
      const resetQuery = "TRUNCATE TABLE users RESTART IDENTITY CASCADE";
      await conn.query(resetQuery);
      conn.release();
    } catch (e) {
      throw e;
    }
  }
}
