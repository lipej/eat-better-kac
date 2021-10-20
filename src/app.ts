import { combineRoutes, httpListener } from '@marblejs/http'
import { logger$ } from '@marblejs/middleware-logger'
import { bodyParser$ } from '@marblejs/middleware-body'

import { login$ } from '@auth'
import { users$ } from '@users'
import { health$ } from '@health'
import { recipes$ } from '@recipes'

const middlewares = [logger$(), bodyParser$()]

const routes = combineRoutes('/api', [health$, login$, users$, recipes$])

export const listener = httpListener({
  middlewares,
  effects: [routes]
})
