import supertest from "supertest";
import app from "../../server";
import { ProductStore, Product } from "../../models/product";

const request = supertest(app);

describe("Tests all routes related to products", () => {
  afterAll(async () => {
    const productStore = new ProductStore();
    await productStore.resetTable();
  });
  describe("creating a product", () => {
    it("tests with no token", async () => {
      const res = await request
        .post("/products")
        .set({ authorization: `Bearer ` });
      expect(res.statusCode).toBe(401);

      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Token is not provided !");
    });
    it("tests with invalid token", async () => {
      const res = await request
        .post("/products")
        .set({ authorization: `Bearer ${invalidDummyToken}` });
      expect(res.statusCode).toBe(401);

      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Invalid token is provided");
    });
    it("tests with valid token and empty body", async () => {
      const res = await request
        .post("/products")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(res.statusCode).toBe(400);
      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([
        {
          msg: "Please provide a valid name for the product",
          param: "name",
          location: "body",
        },
        {
          msg: "Please provide a valid price for the product",
          param: "price",
          location: "body",
        },
        {
          msg: "Please provide a valid category for the product",
          param: "category",
          location: "body",
        },
      ]);
    });
    it("tests with valid token and a body with invalid name", async () => {
      const res = await request
        .post("/products")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          name: 123,
          price: 12,
          category: "cat1",
        });
      expect(res.statusCode).toBe(400);
      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([
        {
          value: 123,
          msg: "Please provide a valid name for the product",
          param: "name",
          location: "body",
        },
      ]);
    });
    it("tests with valid token and a body with invalid price", async () => {
      const res = await request
        .post("/products")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          name: "product1",
          price: "abcd",
          category: "cat1",
        });
      expect(res.statusCode).toBe(400);
      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([
        {
          value: "abcd",
          msg: "Please provide a valid price for the product",
          param: "price",
          location: "body",
        },
      ]);
    });
    it("tests with valid token and a body with invalid category", async () => {
      const res = await request
        .post("/products")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          name: "product1",
          price: 13,
          category: 12,
        });
      expect(res.statusCode).toBe(400);
      expect(Object.keys(res.body)).toContain("errors");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors).toEqual([
        {
          value: 12,
          msg: "Please provide a valid category for the product",
          param: "category",
          location: "body",
        },
      ]);
    });
    it("tests with valid token and a valid body", async () => {
      const res = await request
        .post("/products")
        .set({ authorization: `Bearer ${validDummyToken}` })
        .send({
          name: "product1",
          price: 13,
          category: "cat1",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toEqual({
        id: 1,
        name: "product1",
        price: 13,
        category: "cat1",
      });
    });
  });
  describe("showing all products", () => {
    it("tests fetching products correctly", async () => {
      const res = await request.get("/products");
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toEqual([
        {
          id: 1,
          name: "product1",
          price: 13,
          category: "cat1",
        },
      ]);
    });
  });
  describe("showing a single product by id", () => {
    it("tests with invalid id param", async () => {
      const res = await request.get("/products/abcd");
      expect(res.statusCode).toBe(404);
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual(
        'invalid input syntax for type integer: "NaN"'
      );
    });
    it("tests with non-existing product id param", async () => {
      const res = await request.get("/products/5");
      expect(res.statusCode).toBe(404);
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual(
        "Product associated with this id is not found"
      );
    });
    it("tests with negative product id param", async () => {
      const res = await request.get("/products/-2");
      expect(res.statusCode).toBe(404);
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual(
        "Please provide non-negative product id"
      );
    });
    it("tests with a correct product id param", async () => {
      const res = await request.get("/products/1");
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toEqual({
        id: 1,
        name: "product1",
        price: 13,
        category: "cat1",
      });
    });
  });
});

const validDummyToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJwYXNzd29yZCI6IiQyYiQxMCRTamYwUVd2VzFVSGJBSjBrVkVkSHllNHVzZU03MGlYa1FFd3g1R1pZZmRJUG1DU0hZZzc5TyIsImZpcnN0TmFtZSI6Ill1c3VmIiwibGFzdE5hbWUiOiJBYmRlbGF6aXoifSwiaWF0IjoxNjYzMzcxOTEyfQ.C33_-WIYYZTmdYiBpue09Dw1_mHI2xCP9jV_y6R_CJI";

const invalidDummyToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyLCJmaXJzdG5hbWUiOiJZb3Vzc2vmIiwibGFzdG5hbWUiOiJBYmRlbGF6aXoiLCJwYXNzd29yZCI6IiQyYiQxMCQ1czFmR1diSkJyRWw1OTJjdWlrM1R1a1hJaGpHNkd5VzRScTJRazR2NGZxQlhyNU5JYUVZYSJ9LCJpYXQiOjE2NjMyMzk0ODV9.8JqTeefXai6CZz9Ls2CkgN-990dWo4OKuctgaJwIp3U";
