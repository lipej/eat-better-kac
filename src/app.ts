import { httpListener } from '@marblejs/http'
import { logger$ } from '@marblejs/middleware-logger'
import { bodyParser$ } from '@marblejs/middleware-body'

import { health$ } from '@health'
import { login$ } from '@auth'
import { users$ } from '@users'

const middlewares = [logger$(), bodyParser$()]

const effects = [health$, login$, users$]

export const listener = httpListener({
  middlewares,
  effects
})
