import { r, HttpError, HttpStatus, combineRoutes } from '@marblejs/http'
import { User } from '@prisma/client'
import { throwError, catchError, map, mergeMap } from 'rxjs'

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

export const users$ = combineRoutes('/users', {
  effects: [create$]
})
