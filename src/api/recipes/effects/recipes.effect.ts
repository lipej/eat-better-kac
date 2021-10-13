import { r, HttpError, HttpStatus, combineRoutes } from '@marblejs/http'
import { throwError, catchError, map, mergeMap } from 'rxjs'

import { Recipes } from '@recipes'
import { authorize$, getIdFromToken } from '@auth'
import { Recipe } from '@prisma/client'

type RecipeCreation = Pick<Recipe, 'title' | 'ingredients' | 'preparation' | 'time'>

const create$ = r.pipe(
  r.matchPath('/'),
  r.matchType('POST'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => ({
        ...(req.body as RecipeCreation),
        authorId: getIdFromToken(req.headers.authorization)
      })),
      mergeMap(Recipes.create),
      map((recipe) => ({
        body: {
          success: true,
          message: `recipe sucessfully created, wait for admin publish it`,
          data: recipe
        }
      })),
      catchError(() =>
        throwError(() => new HttpError(`error creating recipe`, HttpStatus.BAD_REQUEST))
      )
    )
  )
)

const delete$ = r.pipe(
  r.matchPath('/:id'),
  r.matchType('DELETE'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => req.params as any),
      map((params) => params.id),
      mergeMap(Recipes.show),
      map((recipe) => recipe.id),
      mergeMap(Recipes.remove),
      map((recipe) => ({
        body: {
          success: true,
          message: `recipe sucessfully deleted`,
          data: recipe
        }
      })),
      catchError((err) => throwError(() => err))
    )
  )
)

export const recipes$ = combineRoutes('/recipes', [create$, delete$])
