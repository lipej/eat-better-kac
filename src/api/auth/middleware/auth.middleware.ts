import { authorize$ as jwt$ } from '@marblejs-contrib/middleware-jwt'
import { Config } from '@config'
import { of, map, mergeMap } from 'rxjs'
import { Users } from '@users'

const config = { secret: Config.jwt.secret }

const verifyPayload$ = (payload: { id: string }) =>
  of(payload).pipe(
    map((payload) => parseInt(payload.id)),
    mergeMap(Users.validate)
  )

export const authorize$ = jwt$(config, verifyPayload$)
