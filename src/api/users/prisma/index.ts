import { prisma } from "@prisma-main";
import { from, map } from "rxjs";
import * as bcrypt from "bcryptjs";
import { LoginCredentials, UserCreation } from "@api/common/interfaces";

export const NOT_FOUND_USER = "User not found";

export default {
  validate(id: number) {
    return from(
      prisma.user.findUnique({
        where: {
          id,
        },
      })
    ).pipe(
      map((user) => {
        if (!user) throw new Error(NOT_FOUND_USER);

        return user;
      })
    );
  },

  findByCredentials(credentials: LoginCredentials) {
    return from(
      prisma.user.findUnique({
        where: {
          email: credentials.login,
        },
      })
    ).pipe(
      map((user) => {
        if (user && bcrypt.compareSync(credentials.password, user.password))
          return user;
        throw new Error(NOT_FOUND_USER);
      })
    );
  },

  create(user: UserCreation) {
    return from(
      prisma.user.create({
        data: { ...user, password: bcrypt.hashSync(user.password) },
      })
    );
  },

  delete(id: number) {
    return from(prisma.user.delete({ where: { id } }).then(() => true));
  },
};
