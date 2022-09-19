import supertest from "supertest";
import app from "../../server";
import { UserStore } from "../../models/user";
const request = supertest(app);

describe("Tests all routes related to users", () => {
  afterAll(async () => {
    // Remove all users created so that user model tests won't fail.
    const store = new UserStore();
    await store.resetTable();
  });
  describe("Creating a user", () => {
    it("tests if user was created without sending anything in body", async () => {
      const res = await request.post("/users").send({});
      expect(res.body).toEqual(errorObj);
    });
    it("tests if user was created with no firstName", async () => {
      const res = await request.post("/users").send({
        lastName: "Abdelaziz",
        password: "123456798",
      });
      expect(res.body).toEqual({
        errors: [errorObj.errors[0], errorObj.errors[1]],
      });
    });
    it("tests if user was created with invalid firstName", async () => {
      const res = await request.post("/users").send({
        firstName: "joe",
        lastName: "Abdelaziz",
        password: "123456798",
      });
      expect(res.body).toEqual({
        errors: [{ ...errorObj.errors[1], value: "joe" }],
      });
    });
    it("tests if user was created with no last name", async () => {
      const res = await request.post("/users").send({
        firstName: "Yusuf",
        password: "123456798",
      });
      expect(res.body).toEqual({
        errors: [errorObj.errors[2], errorObj.errors[3]],
      });
    });
    it("tests if user was created with invalid last name", async () => {
      const res = await request.post("/users").send({
        firstName: "Yusuf",
        lastName: "zizo",
        password: "123456798",
      });
      expect(res.body).toEqual({
        errors: [{ ...errorObj.errors[3], value: "zizo" }],
      });
    });
    it("tests if user was created with no password", async () => {
      const res = await request.post("/users").send({
        firstName: "Yusuf",
        lastName: "Abdelaziz",
      });
      expect(res.body).toEqual({
        errors: [errorObj.errors[4], errorObj.errors[5]],
      });
    });
    it("tests if user was created with invalid password", async () => {
      const res = await request.post("/users").send({
        firstName: "Yusuf",
        lastName: "Abdelaziz",
        password: "1234",
      });
      expect(res.body).toEqual({
        errors: [{ ...errorObj.errors[5], value: "1234" }],
      });
    });
    it("tests if user was created successfully with valid body", async () => {
      const res = await request.post("/users").send({
        firstName: "Yusuf",
        lastName: "Abdelaziz",
        password: "12345678",
      });
      expect(Object.keys(res.body)).toContain("token");
      expect(res.body.token).toBeDefined();
      expect(res.body.token).toBeInstanceOf(String);
    });
  });
  describe("Authenticate a user", () => {
    it("tests if user exist with wrong credentials", async () => {
      const res = await request.get("/users/auth").send({
        firstName: "Joseph",
        lastName: "Abdelaziz",
        password: "12345678",
      });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body).toEqual({ errorMsg: "User is not found !" });
    });
    it("tests if user exist with correct credentials", async () => {
      const res = await request.get("/users/auth").send({
        firstName: "Yusuf",
        lastName: "Abdelaziz",
        password: "12345678",
      });
      expect(Object.keys(res.body)).toContain("token");
      expect(res.body.token).toBeDefined();
      expect(res.body.token).toBeInstanceOf(String);
    });
  });
  describe("Fetch all users", () => {
    it("gets all users with no token", async () => {
      const res = await request.get("/users").set({ authorization: "" });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual(
        "Token doesn't exist in the auth headers"
      );
    });
    it("gets all users with invalid token", async () => {
      const res = await request
        .get("/users")
        .set({ authorization: `Bearer ${invalidDummyToken}` });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Invalid token is provided");
    });
    it("gets all users with valid token", async () => {
      const res = await request
        .get("/users")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body).toEqual([
        { firstName: "Yusuf", lastName: "Abdelaziz", id: 1 },
      ]);
    });
  });
  describe("fetch a single user", () => {
    it("gets a single with no token", async () => {
      const res = await request.get("/users/1").set({ authorization: "" });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual(
        "Token doesn't exist in the auth headers"
      );
    });
    it("gets a single with invalid token", async () => {
      const res = await request
        .get("/users/1")
        .set({ authorization: `Bearer ${invalidDummyToken}` });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual("Invalid token is provided");
    });
    it("gets a single user with valid token and invalid user id", async () => {
      const res = await request
        .get("/users/abc")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual(
        'invalid input syntax for type integer: "NaN"'
      );
    });
    it("gets a single user with valid token and non-existing valid user id", async () => {
      const res = await request
        .get("/users/2")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(Object.keys(res.body)).toContain("errorMsg");
      expect(res.body.errorMsg).toBeDefined();
      expect(res.body.errorMsg).toBeInstanceOf(String);
      expect(res.body.errorMsg).toEqual(
        "User associated with this id is not found"
      );
    });
    it("gets a single user with valid token and an existing valid user id", async () => {
      const res = await request
        .get("/users/1")
        .set({ authorization: `Bearer ${validDummyToken}` });
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toEqual({
        firstName: "Yusuf",
        lastName: "Abdelaziz",
        id: 1,
      });
    });
  });
});

const errorObj = {
  errors: [
    { msg: "Invalid value", param: "firstName", location: "body" },
    {
      msg: "Please provide a valid first name with at least 5 characters",
      param: "firstName",
      location: "body",
    },
    { msg: "Invalid value", param: "lastName", location: "body" },
    {
      msg: "Please provide a valid last name with at least 5 characters",
      param: "lastName",
      location: "body",
    },
    { msg: "Invalid value", param: "password", location: "body" },
    {
      msg: "Please provide a strong password with a length of 8 characters at least",
      param: "password",
      location: "body",
    },
  ],
};

const validDummyToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyLCJmaXJzdG5hbWUiOiJZb3Vzc2VmIiwibGFzdG5hbWUiOiJBYmRlbGF6aXoiLCJwYXNzd29yZCI6IiQyYiQxMCQ1czFmR1diSkJyRWw1OTJjdWlrM1R1a1hJaGpHNkd5VzRScTJRazR2NGZxQlhyNU5JYUVZYSJ9LCJpYXQiOjE2NjMyMzk0ODV9.8JqTeefXai6CZz9Ls2CkgN-990dWo4OKuctgaJwIp3U";

const invalidDummyToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyLCJmaXJzdG5hbWUiOiJZb3Vzc2vmIiwibGFzdG5hbWUiOiJBYmRlbGF6aXoiLCJwYXNzd29yZCI6IiQyYiQxMCQ1czFmR1diSkJyRWw1OTJjdWlrM1R1a1hJaGpHNkd5VzRScTJRazR2NGZxQlhyNU5JYUVZYSJ9LCJpYXQiOjE2NjMyMzk0ODV9.8JqTeefXai6CZz9Ls2CkgN-990dWo4OKuctgaJwIp3U";
