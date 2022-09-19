import { Product, ProductStore } from "../../models/product";

const store = new ProductStore();

describe("Tests product model", () => {
  describe("tests create method", () => {
    it("checks if a product was successfully created", async () => {
      const product: Product = {
        category: "cat1",
        name: "product 1",
        price: 2,
      };
      const returnedProduct = await store.create(product);
      expect(returnedProduct).toEqual({ ...product, id: 1 });
    });
  });

  describe("tests index method", () => {
    it("retrieves a list of products by a product id", async () => {
      const returnedProduct = await store.index();
      expect(returnedProduct).toEqual([
        {
          category: "cat1",
          name: "product 1",
          price: 2,
          id: 1,
        },
      ]);
    });
  });

  describe("tests show method", () => {
    it("retrieves a single product by a product id", async () => {
      const productId = 1;
      const returnedProduct = await store.show(productId);
      const product: Product = {
        category: "cat1",
        name: "product 1",
        price: 2,
        id: 1,
      };
      expect(returnedProduct).toEqual(product);
    });
  });

  describe("tests productExistById method", () => {
    it("checks if a product with a specific id is returned", async () => {
      const productExist1 = await store.productExistById(1);
      expect(productExist1).toBeTrue();
      const productExist2 = await store.productExistById(2);
      expect(productExist2).toBeFalse();
    });
  });
});
