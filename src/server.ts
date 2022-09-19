import express, { Request, Response } from "express";
import usersRoutes from "./handlers/users";
import productsRoutes from "./handlers/products";
import ordersRoutes from "./handlers/orders";

const app: express.Application = express();
const address: string = "0.0.0.0:3000";

app.use(express.json());

app.get("/", function (req: Request, res: Response) {
  res.send("Hello to main root, kindly go to routes defined in README file");
});

app.listen(3000, function () {
  console.log(`starting app on: ${address}`);
});

usersRoutes(app);
productsRoutes(app);
ordersRoutes(app);

export default app;
