import { Config } from "@config";
import { generateExpirationInHours } from "@marblejs/middleware-jwt";
import { User } from "@prisma/client";

export const generateTokenPayload = (user: User) => {
  return {
    id: user.id,
    role: user.role,
    exp: generateExpirationInHours(Config.jwt.expires),
  };
};
