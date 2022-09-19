import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const tokenSecret = process.env.TOKEN_SECRET as string;

/**
 * @description A middleware to validate a JWT.
 * @param {Request} req - The request received from the user.
 * @param {Response} res - The response sent to the user.
 * @param {NextFunction} next - The next function that is called to trigger
 * the next middleware function.
 */
export function validateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.url.endsWith("auth")) next();
  try {
    if (req.headers.authorization) {
      const authorizationHeader = req.headers.authorization;
      const token = authorizationHeader.split(" ")[1];
      if (token) {
        jwt.verify(token, tokenSecret);
        next();
      } else {
        throw new Error("Token is not provided !");
      }
    } else {
      throw new Error("Token doesn't exist in the auth headers");
    }
  } catch (e) {
    let errorMsg = (e as Error).message;

    if (errorMsg == "invalid signature") {
      errorMsg = "Invalid token is provided";
    }
    res.status(401);
    res.json({ errorMsg });
    return;
  }
}
/**
 * @description Extracts payload from JWT after it's validated using validateToken middleware.
 * @param {Request} req - The request received from the user
 * @returns {jwt.JwtPayload} Payload that exist inside the JWT.
 */
export function extractPayloadFromToken(req: Request): jwt.JwtPayload {
  const authorizationHeader = req.headers.authorization as string;
  const token = authorizationHeader.split(" ")[1];
  return jwt.verify(token, tokenSecret) as jwt.JwtPayload;
}
