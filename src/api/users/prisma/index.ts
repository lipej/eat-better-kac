import { prisma } from "@prisma-main";
import { from } from "rxjs";

export interface LoginCredentials {
  login: string;
  password: string;
}

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
          if (!user) throw new Error();

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
        .then((user) => (user?.password === credentials.password ? user : null))
    );
  },
};
