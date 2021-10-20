import { authorize$ as jwt$ } from '@marblejs-contrib/middleware-jwt'
import { of, map, mergeMap } from 'rxjs'

import { Config } from '@config'
import { Users } from '@users'
import { User } from '@prisma/client'

const config = { secret: Config.jwt.secret }

const verifyPayload$ = (payload: { id: string }) =>
  of(payload).pipe(
    map((payload) => Number(payload.id)),
    mergeMap(Users.validate),
    map((user) => user as User),
    map((user) => ({ id: user.id, role: user.role }))
  )

export const authorize$ = jwt$(config, verifyPayload$)
