import express from "express";
import {
  body,
  check,
  param,
  ValidationChain,
  validationResult,
} from "express-validator";
import { Order, OrderStore } from "../models/order";
import {
  validateToken,
  extractPayloadFromToken,
} from "../utils/tokenValidator";
import { orderExist, productExist } from "../services/checker";

const store = new OrderStore();

const indexByUserId = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = parseInt(req.params.id);
  const orders = await store.indexByUserId(userId);
  res.status(200);
  if (orders.length) {
    res.json(orders);
  } else {
    res.json({ errorMsg: "This user has no orders" });
  }
  try {
  } catch (e) {
    const errorMsg = (e as Error).message;
    res.status(400);
    res.json({ errorMsg });
  }
};

const addProduct = async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const data: { productId: number; orderId: number; productQty: number } = {
      productId: parseInt(req.body.productId),
      orderId: parseInt(req.body.orderId),
      productQty: parseInt(req.body.productQty),
    };
    if (!(await orderExist(data.orderId))) {
      throw new Error("Order id is not found");
    }
    if (!(await productExist(data.productId))) {
      throw new Error("Product id is not found");
    }

    const orders = await store.addProduct(data);
    res.status(200);
    res.json(orders);
  } catch (e) {
    const errorMsg = (e as Error).message;
    res.status(400);
    res.json({ errorMsg });
  }
};

const addOrder = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const tokenPayload = extractPayloadFromToken(req);
  const user = tokenPayload.user;
  const order: Order = {
    status: req.body.status,
    userId: user.id,
    products: req.body.products,
  };
  if (order.products) {
    for (let product of order.products) {
      const doProductExist = await productExist(product.id);
      if (!doProductExist) {
        throw new Error(`Product id ${product.id} is not found in products`);
      }
    }
  } else {
    res.status(400);
    res.json({
      errorMsg: `Products are undefined`,
    });
    return;
  }
  try {
    const addedOrder = await store.addOrder(order);
    res.json(addedOrder);
  } catch (e) {
    const errorMsg = (e as Error).message;
    res.status(400);
    res.json({ errorMsg });
  }
};

function ordersRoutes(app: express.Application) {
  app.get(
    "/orders-by-user/:id",
    validateToken,
    param("id").isInt({ min: 1 }).withMessage("Please provide a valid user id"),
    indexByUserId
  );
  app.post(
    "/orders/products",
    validateToken,
    ...validateAddProductBodyParameters(),
    addProduct
  );
  app.post(
    "/orders",
    validateToken,
    ...validateAddOrderBodyParameters(),
    addOrder
  );
}

export default ordersRoutes;

function validateAddProductBodyParameters(): ValidationChain[] {
  return [
    body("productId")
      .isInt({ min: 1 })
      .withMessage("Please provide a valid product id"),
    body("orderId")
      .isInt({ min: 1 })
      .withMessage("Please provide a valid order id"),
    body("productQty")
      .isInt({ min: 1 })
      .withMessage("Please provide a valid product quantity (larger than 0)"),
  ];
}

function validateAddOrderBodyParameters(): ValidationChain[] {
  return [
    body("status")
      .isString()
      .isIn(["pending", "complete"])
      .withMessage("Please provide a valid status value (pending, complete)"),
    body("products")
      .isArray({ min: 1 })
      .withMessage("Please provide a list of products with at least 1 product"),
    check("products.*.qty")
      .toInt()
      .isInt({ min: 1 })
      .withMessage("Please provide a valid products quantity (bigger than 0)"),
    check("products.*.id")
      .toInt()
      .isInt({ min: 1 })
      .withMessage("Please provide a valid product id"),
  ];
}
