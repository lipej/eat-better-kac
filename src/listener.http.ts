import { httpListener } from "@marblejs/core";
import { logger$ } from "@marblejs/middleware-logger";
import { bodyParser$ } from "@marblejs/middleware-body";
import { health$ } from "./effects/health.effects";

const middlewares = [logger$(), bodyParser$()];

const effects = [health$];

export const listener = httpListener({
  middlewares,
  effects,
});
