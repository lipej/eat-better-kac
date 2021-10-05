import { r, HttpError, HttpStatus } from "@marblejs/http";
import { throwError } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { generateTokenPayload } from "@api/auth/helpers/token.helper";
import { generateToken } from "@marblejs/middleware-jwt";
import { Config } from "@config";
import User, { LoginCredentials } from "@api/users/prisma";

export const login$ = r.pipe(
  r.matchPath("/auth"),
  r.matchType("POST"),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => req.body as LoginCredentials),
      mergeMap(User.findByCredentials),
      map(generateTokenPayload),
      map(generateToken({ secret: Config.jwt.secret })),
      map((token) => ({ body: { token } })),
      catchError(() =>
        throwError(() => new HttpError("Unauthorized", HttpStatus.UNAUTHORIZED))
      )
    )
  )
);
