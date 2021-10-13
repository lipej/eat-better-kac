import { r, HttpError, HttpStatus, combineRoutes } from '@marblejs/http'
import { User } from '@prisma/client'
import { throwError, catchError, map, mergeMap } from 'rxjs'

import { getIdFromToken, authorize$ } from '@auth'
import { Users } from '@users'

export type UserCreation = Omit<User, 'id' | 'role'>

const create$ = r.pipe(
  r.matchPath('/'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => req.body as UserCreation),
      mergeMap(Users.create),
      map((user) => ({
        body: {
          success: true,
          message: `use ${user.email} as username and your password to login`
        }
      })),
      catchError(() =>
        throwError(() => new HttpError(`error creating user`, HttpStatus.BAD_REQUEST))
      )
    )
  )
)

const delete$ = r.pipe(
  r.matchPath('/'),
  r.matchType('DELETE'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => req.headers.authorization),
      map((token) => getIdFromToken(token)),
      mergeMap(Users.delete),
      map(() => ({
        body: {
          success: true,
          message: `user deleted, you can't login anymore`
        }
      }))
    )
  )
)

export const users$ = combineRoutes('/users', {
  effects: [create$, delete$]
})
