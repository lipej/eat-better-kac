import { prisma } from "@prisma-main";
import { from } from "rxjs";
import * as bcrypt from "bcryptjs";

export interface LoginCredentials {
  login: string;
  password: string;
}

export const NOT_FOUND_USER = "User not found";

export default {
  validate(id: number) {
    return from(
      prisma.user
        .findUnique({
          where: {
            id,
          },
        })
        .then((user) => {
          if (!user) throw new Error(NOT_FOUND_USER);

          return user;
        })
    );
  },

  findByCredentials(credentials: LoginCredentials) {
    return from(
      prisma.user
        .findUnique({
          where: {
            email: credentials.login,
          },
        })
        .then((user) => {
          if (user && bcrypt.compareSync(credentials.password, user.password))
            return user;

          throw new Error(NOT_FOUND_USER);
        })
    );
  },
};
