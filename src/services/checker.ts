import { OrderStore } from "../models/order";
import { ProductStore } from "../models/product";
import { UserStore } from "../models/user";

const userStore = new UserStore();
const productStore = new ProductStore();
const orderStore = new OrderStore();

async function userExist(userId: number): Promise<boolean> {
  try {
    return await userStore.userExistById(userId);
  } catch (e) {
    throw e;
  }
}

async function productExist(productId: number): Promise<boolean> {
  try {
    return await productStore.productExistById(productId);
  } catch (e) {
    throw e;
  }
}

async function orderExist(orderId: number): Promise<boolean> {
  try {
    return await orderStore.orderExistById(orderId);
  } catch (e) {
    throw e;
  }
}

export { userExist, productExist, orderExist };
