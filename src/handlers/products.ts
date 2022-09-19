import express from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import { Product, ProductStore } from "../models/product";
import { validateToken } from "../utils/tokenValidator";

const store = new ProductStore();

const index = async (_req: express.Request, res: express.Response) => {
  try {
    const products = await store.index();
    if (products.length) {
      res.status(200);
      res.json(products);
    } else {
      throw new Error("No products found");
    }
  } catch (e) {
    res.status(404);
    res.json({ errorMsg: (e as Error).message });
  }
};

const create = async (req: express.Request, res: express.Response) => {
  try {
    const user: Product = {
      name: req.body.name,
      price: parseInt(req.body.price),
      category: req.body.category,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const newProduct = await store.create(user);
    res.status(200);
    res.json(newProduct);
  } catch (e) {
    const message = (e as Error).message;
    res.status(400);
    res.json({ errorMsg: message });
  }
};

const show = async (req: express.Request, res: express.Response) => {
  try {
    const productId = parseInt(req.params.id);
    if (productId <= 0) {
      throw new Error("Please provide non-negative product id");
    }
    const product = await store.show(productId);
    res.status(200);
    res.json(product);
  } catch (e) {
    const message = (e as Error).message;
    res.status(404);
    res.json({ errorMsg: message });
  }
};

export default function productsRoutes(app: express.Application) {
  app.post("/products", ...validateBodyParameters(), validateToken, create);
  app.get("/products", index);
  app.get("/products/:id", show);
}

/**
 * @description Provides the validation rules for each parameter.
 * @returns {ValidationChain[]} list of validation chains that act like a list of middleware to process each query
 * parameter.
 */

function validateBodyParameters(): ValidationChain[] {
  return [
    body("name")
      .isString()
      .withMessage("Please provide a valid name for the product"),
    body("price")
      .isFloat({ min: 1 })
      .withMessage("Please provide a valid price for the product"),
    body("category")
      .isString()
      .withMessage("Please provide a valid category for the product"),
  ];
}
