import { authorize$ as jwt$ } from "@marblejs/middleware-jwt";
import { Config } from "@config";
import { catchError, mergeMap, map, of, throwError } from "rxjs";
import { HttpError, HttpStatus } from "@marblejs/core";
import User from "@api/users/prisma";

const config = { secret: Config.jwt.secret };

const verifyPayload$ = (payload: { id: string }) =>
  of(payload).pipe(
    map((payload) => parseInt(payload.id)),
    mergeMap(User.validate),
    catchError(() =>
      throwError(() => new HttpError("Unauthorized", HttpStatus.UNAUTHORIZED))
    )
  );

export const authorize$ = jwt$(config, verifyPayload$);
