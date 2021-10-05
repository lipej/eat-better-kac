import { httpListener } from "@marblejs/core";
import { logger$ } from "@marblejs/middleware-logger";
import { bodyParser$ } from "@marblejs/middleware-body";

import health$ from "@api-health";
import { login$ } from "@api/auth/effects/login.effect";

const middlewares = [logger$(), bodyParser$()];

const effects = [health$, login$];

export const listener = httpListener({
  middlewares,
  effects,
});
