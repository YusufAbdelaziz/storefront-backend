import express from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import { User, UserStore } from "../models/user";
import { validateToken } from "../utils/tokenValidator";
import jwt from "jsonwebtoken";

const store = new UserStore();

const index = async (_req: express.Request, res: express.Response) => {
  try {
    const users = await store.index();
    if (users.length) {
      res.status(200);
      res.json(users);
    } else {
      throw new Error("No users found");
    }
  } catch (e) {
    res.status(404);
    res.json({ errorMsg: (e as Error).message });
  }
};

const create = async (req: express.Request, res: express.Response) => {
  try {
    const user: User = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: String(req.body.password),
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const newUser = await store.create(user);
    const token = jwt.sign(
      { user: newUser },
      process.env.TOKEN_SECRET as string
    );
    res.status(200);
    res.json({ token: token });
  } catch (e) {
    const message = (e as Error).message;
    res.status(401);
    res.json({ errorMsg: message });
  }
};

const show = async (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId <= 0) {
      throw new Error("Please provide non-negative id");
    }
    const user = await store.show(userId);
    res.status(200);
    res.json(user);
  } catch (e) {
    const message = (e as Error).message;
    res.status(401);
    res.json({ errorMsg: message });
  }
};

const auth = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user: User = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
    };
    const existingUser = await store.authenticate(user);
    if (!existingUser) throw new Error("Incorrect password for this user");
    const token = jwt.sign(
      { user: existingUser },
      process.env.TOKEN_SECRET as string
    );
    res.status(200);
    res.json({ token: token });
  } catch (e) {
    const message = (e as Error).message;
    res.status(401);
    res.json({ errorMsg: message });
  }
};

export default function usersRoutes(app: express.Application) {
  app.post("/users", ...validateBodyParameters(), create);
  app.get("/users/auth", ...validateBodyParameters(), auth);
  app.get("/users", validateToken, index);
  app.get("/users/:id", validateToken, show);
}

/**
 * @description Provides the validation rules for each parameter.
 * @returns {ValidationChain[]} list of validation chains that act like a list of middleware to process each query
 * parameter.
 */

function validateBodyParameters(): ValidationChain[] {
  return [
    body("firstName")
      .isString()
      .isLength({ min: 5 })
      .withMessage(
        "Please provide a valid first name with at least 5 characters"
      ),
    body("lastName")
      .isString()
      .isLength({ min: 5 })
      .withMessage(
        "Please provide a valid last name with at least 5 characters"
      ),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage(
        "Please provide a strong password with a length of 8 characters at least"
      ),
  ];
}
