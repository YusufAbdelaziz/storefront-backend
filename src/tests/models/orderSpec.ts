import { OrderStore, Order, Status } from "../../models/order";
import { ProductStore, Product } from "../../models/product";
import { User, UserStore } from "../../models/user";

const orderStore = new OrderStore();
const userStore = new UserStore();
const productStore = new ProductStore();

describe("Tests order model", () => {
  beforeAll(async () => {
    /// Before starting any tests, we need to create a user.
    const newUser: User = {
      firstName: "Yusuf",
      lastName: "Abdelaziz",
      password: "01004895720",
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
  describe("check if addOrder method adds a new order associated with a user id", () => {
    it("tests adding an order", async () => {
      const order: Order = {
        status: Status.Pending,
        userId: 1,
        products: [{ id: 1, qty: 22 }],
      };
      const returnedOrder = await orderStore.addOrder(order);
      expect(returnedOrder).toEqual({ ...order, id: 1 });
    });
  });
  describe("check if orderExistById checks for a specific order with an id", () => {
    it("tests the existence of an order", async () => {
      const existOrder1 = await orderStore.orderExistById(1);
      expect(existOrder1).toBeTrue();
      const existOrder2 = await orderStore.orderExistById(2);
      expect(existOrder2).toBeFalse();
    });
  });
  describe("check if addProduct adds an existing product for a specific order", () => {
    it("tests addProduct", async () => {
      const orderProduct: {
        orderId: number;
        productId: number;
        productQty: number;
      } = {
        productQty: 1,
        orderId: 1,
        productId: 2,
      };
      const returnedProduct = await orderStore.addProduct(orderProduct);
      expect(returnedProduct).toEqual({ ...orderProduct, id: 2 });
    });
  });
  describe("check if indexByUserId method returns an order by its user id", () => {
    it("tests addProduct", async () => {
      const returnedOrders = await orderStore.indexByUserId(1);
      expect(returnedOrders.length).toEqual(1);
      expect(returnedOrders[0].products).toBeDefined();
      expect(returnedOrders[0].products?.length).toEqual(2);
      expect(returnedOrders[0].products![0]).toEqual({ id: 1, qty: 22 });
      expect(returnedOrders[0].products![1]).toEqual({ id: 2, qty: 1 });
    });
  });
});
