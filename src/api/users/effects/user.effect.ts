import { r, HttpError, HttpStatus, combineRoutes } from "@marblejs/http";
import { throwError } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";

import UserDao from "@api/users/prisma";
import { getIdFromToken } from "@api/auth/helpers/decode.helper";
import { authorize$ } from "@api/auth/middleware/auth.middleware";
import { UserCreation } from "@api/common/interfaces";

const create$ = r.pipe(
  r.matchPath("/"),
  r.matchType("POST"),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => req.body as UserCreation),
      mergeMap(UserDao.create),
      map((user) => ({
        body: {
          success: true,
          message: `use ${user.email} as username and your password to login`,
        },
      })),
      catchError(() =>
        throwError(
          () => new HttpError(`error creating user`, HttpStatus.BAD_REQUEST)
        )
      )
    )
  )
);

const delete$ = r.pipe(
  r.matchPath("/"),
  r.matchType("DELETE"),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => req.headers.authorization),
      map((token) => getIdFromToken(token)),
      mergeMap(UserDao.delete),
      map(() => ({
        body: {
          success: true,
          message: `user deleted, you can't login anymore`,
        },
      })),
      catchError(() =>
        throwError(
          () => new HttpError(`error deleting user`, HttpStatus.BAD_REQUEST)
        )
      )
    )
  )
);

export const users$ = combineRoutes("/users", {
  effects: [create$, delete$],
});
