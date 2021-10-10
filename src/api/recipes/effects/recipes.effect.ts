import { r, HttpError, HttpStatus, combineRoutes } from '@marblejs/http'
import { throwError, catchError, map, mergeMap } from 'rxjs'

import { Recipes } from '@recipes'
import { authorize$ } from '@auth'
import { mountData } from '../utils/mount-data.util'
import { RecipeCreation } from '@common'
import { Params } from 'api/common/interfaces/params.interface'

const create$ = r.pipe(
  r.matchPath('/'),
  r.matchType('POST'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) =>
        mountData({
          body: req.body as RecipeCreation,
          token: req.headers.authorization as string
        })
      ),
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
      map((req) => req.params as Params),
      map((params) => parseInt(params.id)),
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
