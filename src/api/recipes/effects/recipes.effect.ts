import { authorize$, getIdFromToken } from '@auth'
import { r, HttpError, HttpStatus, combineRoutes } from '@marblejs/http'
import { Recipe } from '@prisma/client'
import { Recipes } from '@recipes'
import { recipeChecker$ } from '@recipes'
import { throwError, catchError, map, mergeMap } from 'rxjs'

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
      map((data) => ({
        body: {
          success: true,
          message: `recipe sucessfully created, wait for admin publish it`,
          data
        }
      })),
      catchError(() =>
        throwError(() => new HttpError(`Error when try to create recipe`, HttpStatus.BAD_REQUEST))
      )
    )
  )
)

const delete$ = r.pipe(
  r.matchPath('/:id'),
  r.matchType('DELETE'),
  r.use(authorize$),
  r.use(recipeChecker$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => req.params.id),
      mergeMap(Recipes.remove),
      map((data) => ({
        body: {
          success: true,
          message: `recipe sucessfully deleted`,
          data
        }
      })),
      catchError(() =>
        throwError(() => new HttpError(`Error when try to delete recipe`, HttpStatus.BAD_REQUEST))
      )
    )
  )
)

const update$ = r.pipe(
  r.matchPath('/:id'),
  r.matchType('PATCH'),
  r.use(authorize$),
  r.use(recipeChecker$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => ({ id: req.params.id, fields: req.body })),
      mergeMap(Recipes.update),
      map((data) => ({
        body: {
          success: true,
          message: `recipe sucessfully updated`,
          data
        }
      })),
      catchError(() =>
        throwError(() => new HttpError(`Error when try to update recipe`, HttpStatus.BAD_REQUEST))
      )
    )
  )
)

const show$ = r.pipe(
  r.matchPath('/:id'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => req.params.id),
      mergeMap(Recipes.show),
      map((data) => ({
        body: {
          success: true,
          data
        }
      })),
      catchError((err) => throwError(() => err))
    )
  )
)

const showMany$ = r.pipe(
  r.matchPath('/'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => req.query),
      mergeMap(Recipes.showMany),
      map((data) => ({
        body: {
          success: true,
          data
        }
      })),
      catchError((err) => throwError(() => err))
    )
  )
)

export const recipes$ = combineRoutes('/recipes', [create$, delete$, update$, show$, showMany$])
