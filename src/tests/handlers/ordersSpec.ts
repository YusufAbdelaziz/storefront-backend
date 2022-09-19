import supertest from "supertest";
import app from "../../server";
import { OrderStore } from "../../models/order";
import { ProductStore, Product } from "../../models/product";
import { User, UserStore } from "../../models/user";

const request = supertest(app);

const productStore = new ProductStore();
const orderStore = new OrderStore();
const userStore = new UserStore();

describe("Tests all routes related to orders", () => {
  beforeAll(async () => {
    /// Before starting any tests, we need to create a user.
    const newUser: User = {
      firstName: "Yusuf",
      lastName: "Abdelaziz",
      password: "12345678",
    };
    /// A new user must be created so we can associate this user with the order
    await userStore.create(newUser);
    /// We also need to create a product.
    const product1: Product = {
      category: "cat1",
      name: "product 1",
      price: 2,
    };
    await productStore.create(product1);

    const product2: Product = {
      category: "cat1",
      name: "product 2",
      price: 2,
    };
    await productStore.create(product2);
  });

  afterAll(async () => {
    await orderStore.resetTables();
    await userStore.resetTable();
    await productStore.resetTable();
  });
  describe("Creating an order to an existing user", () => {
    it("tests an order with no token and no body", async () => {
      const res = await request
        .post("/orders")
        .set({ authorization: `Bearer ` });

      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Token is not provided !");
    });
    it("tests an order with an invalid token and no body", async () => {
      const res = await request
        .post("/orders")
        .set({ authorization: `Bearer ${invalidDummyToken}` });

      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Invalid token is provided");
    });
    it("tests an order with a valid token and no body", async () => {
      const res = await request
        .post("/orders")
        .set({ authorization: `Bearer ${validDummyToken}` });

      expect(res.body).toEqual({
        errors: [errorObj.errors[0], errorObj.errors[1], errorObj.errors[2]],
      });
    });
    it("tests an order with a valid token and a body with an invalid status and empty products", async () => {
      const res = await request
        .post("/orders")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          status: "active",
          products: {},
        });

      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([errorObj.errors[5], errorObj.errors[4]]);
    });
    it("tests an order with a valid token and a body with an valid status and products that have incorrect properties", async () => {
      const res = await request
        .post("/orders")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          status: "complete",
          products: [
            {
              product_id: 1,
              qty: 2,
            },
          ],
        });
      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([
        {
          value: null,
          msg: "Please provide a valid product id",
          param: "products[0].id",
          location: "body",
        },
      ]);
    });
    it("tests an order with a valid token and a body with an valid status and valid products", async () => {
      const res = await request
        .post("/orders")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          status: "pending",
          products: [
            {
              id: 1,
              qty: 2,
            },
          ],
        });
      expect(res.body).toEqual({
        id: 1,
        userId: 1,
        status: "pending",
        products: [
          {
            id: 1,
            qty: 2,
          },
        ],
      });
    });
  });
  describe("adds a product to an order", () => {
    it("tests with no token and empty body", async () => {
      const res = await request
        .post("/orders/products")
        .set({ authorization: `Bearer ` });

      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Token is not provided !");
    });
    it("tests with invalid token and empty body", async () => {
      const res = await request
        .post("/orders/products")
        .set({ authorization: `Bearer ${invalidDummyToken}` });

      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Invalid token is provided");
    });
    it("tests with valid token and empty body", async () => {
      const res = await request
        .post("/orders/products")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({});
      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([
        {
          msg: "Please provide a valid product id",
          param: "productId",
          location: "body",
        },
        {
          msg: "Please provide a valid order id",
          param: "orderId",
          location: "body",
        },
        {
          msg: "Please provide a valid product quantity (larger than 0)",
          param: "productQty",
          location: "body",
        },
      ]);
    });
    it("tests with valid token and valid body", async () => {
      const res = await request
        .post("/orders/products")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          productId: 1,
          orderId: 1,
          productQty: 45,
        });
      expect(res.body).toBeDefined();
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toEqual({
        id: 2,
        orderId: 1,
        productId: 1,
        productQty: 45,
      });
    });
  });
  describe("Fetching a user's orders by id", () => {
    it("tests with invalid token", async () => {
      const res = await request
        .get("/orders-by-user/1")
        .set({ authorization: `Bearer ${invalidDummyToken}` });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.statusCode).toBe(401);
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Invalid token is provided");
    });
    it("tests with valid token and invalid param", async () => {
      const res = await request
        .get("/orders-by-user/abcdefg")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(res.statusCode).toBe(400);
      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([
        {
          msg: "Please provide a valid user id",
          value: "abcdefg",
          param: "id",
          location: "params",
        },
      ]);
    });
    it("tests with valid token and wrong user id", async () => {
      const res = await request
        .get("/orders-by-user/5")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(res.statusCode).toBe(200);
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("This user has no orders");
    });
    it("tests with valid token and correct user id", async () => {
      const res = await request
        .get("/orders-by-user/1")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(res.body).toEqual([
        {
          status: "pending",
          userId: 1,
          id: 1,
          products: [
            { id: 1, qty: 2 },
            { id: 1, qty: 45 },
          ],
        },
      ]);
    });
  });
});

const errorObj = {
  errors: [
    { msg: "Invalid value", param: "status", location: "body" },
    {
      msg: "Please provide a valid status value (pending, complete)",
      param: "status",
      location: "body",
    },
    {
      msg: "Please provide a list of products with at least 1 product",
      param: "products",
      location: "body",
    },
    {
      msg: "Please provide a list of products with at least 1 product",
      param: "products",
      location: "body",
    },
    {
      value: {},
      msg: "Please provide a list of products with at least 1 product",
      param: "products",
      location: "body",
    },
    {
      value: "active",
      msg: "Please provide a valid status value (pending, complete)",
      param: "status",
      location: "body",
    },
  ],
};

const validDummyToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJwYXNzd29yZCI6IiQyYiQxMCRTamYwUVd2VzFVSGJBSjBrVkVkSHllNHVzZU03MGlYa1FFd3g1R1pZZmRJUG1DU0hZZzc5TyIsImZpcnN0TmFtZSI6Ill1c3VmIiwibGFzdE5hbWUiOiJBYmRlbGF6aXoifSwiaWF0IjoxNjYzMzcxOTEyfQ.C33_-WIYYZTmdYiBpue09Dw1_mHI2xCP9jV_y6R_CJI";

const invalidDummyToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyLCJmaXJzdG5hbWUiOiJZb3Vzc2vmIiwibGFzdG5hbWUiOiJBYmRlbGF6aXoiLCJwYXNzd29yZCI6IiQyYiQxMCQ1czFmR1diSkJyRWw1OTJjdWlrM1R1a1hJaGpHNkd5VzRScTJRazR2NGZxQlhyNU5JYUVZYSJ9LCJpYXQiOjE2NjMyMzk0ODV9.8JqTeefXai6CZz9Ls2CkgN-990dWo4OKuctgaJwIp3U";
