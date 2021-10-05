import { generateExpirationInHours } from "@marblejs/middleware-jwt";
import { User } from "@prisma/client";

export const generateTokenPayload = (user: User | null) => {
  if (user === null) throw new Error();
  return {
    id: user.id,
    email: user.email,
    exp: generateExpirationInHours(4),
  };
};
