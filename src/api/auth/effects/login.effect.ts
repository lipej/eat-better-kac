import { r, HttpError, HttpStatus } from '@marblejs/http'
import { throwError, catchError, map, mergeMap } from 'rxjs'
import { generateToken } from '@marblejs-contrib/middleware-jwt'

import { Config } from '@config'
import { generateTokenPayload } from '@auth'
import { Users } from '@users'
import { LoginCredentials } from '@common'

export const login$ = r.pipe(
  r.matchPath('/auth'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => req.body as LoginCredentials),
      mergeMap(Users.findByCredentials),
      map(generateTokenPayload),
      map(generateToken({ secret: Config.jwt.secret })),
      map((token) => ({ body: { token } })),
      catchError(() => throwError(() => new HttpError('Unauthorized', HttpStatus.UNAUTHORIZED)))
    )
  )
)
