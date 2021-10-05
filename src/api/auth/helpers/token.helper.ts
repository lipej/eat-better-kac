import { Config } from "@config";
import { generateExpirationInHours } from "@marblejs/middleware-jwt";
import { User } from "@prisma/client";

export const generateTokenPayload = (user: User) => {
  return {
    id: user.id,
    email: user.email,
    exp: generateExpirationInHours(Config.jwt.expires),
  };
};
