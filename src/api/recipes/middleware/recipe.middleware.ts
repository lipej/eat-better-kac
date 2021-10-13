import { HttpMiddlewareEffect } from '@marblejs/http'
import { catchError, tap, throwError } from 'rxjs'

import { Recipes } from '@recipes'

export const recipeChecker$: HttpMiddlewareEffect = (req$) =>
  req$.pipe(
    tap((req: any) => Recipes.show(req.params.id)),
    catchError((err) => throwError(() => err))
  )
