import { authorize$, canHandle } from '@auth'
import { r, combineRoutes, HttpError, HttpStatus } from '@marblejs/http'
import { Recipe } from '@prisma/client'
import { Recipes } from '@recipes'
import { throwError, catchError, map, mergeMap } from 'rxjs'

type RecipeCreation = Pick<Recipe, 'title' | 'ingredients' | 'preparation' | 'time'>

const create$ = r.pipe(
  r.matchPath('/'),
  r.matchType('POST'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => ({
        ...(req.body as RecipeCreation),
        ingredients: JSON.stringify(req.body.ingredients),
        authorId: req.user.id
      })),
      mergeMap(Recipes.create),
      map((data) => ({
        body: {
          success: true,
          message: `recipe sucessfully created, wait for admin publish it`,
          data: { ...data, ingredients: JSON.parse(data.ingredients) }
        }
      })),
      catchError((err) =>
        throwError(() => new HttpError(`Error when try to create recipe`, HttpStatus.BAD_REQUEST))
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
      map((req: any) => ({ id: Number(req.params.id) })),
      mergeMap(Recipes.remove),
      map((data) => ({
        body: {
          success: true,
          message: `recipe sucessfully deleted`,
          data: { ...data, ingredients: JSON.parse(data.ingredients) }
        }
      })),
      catchError((err) => throwError(() => err))
    )
  )
)

const update$ = r.pipe(
  r.matchPath('/:id'),
  r.matchType('PATCH'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => ({ id: Number(req.params.id), fields: req.body })),
      mergeMap(Recipes.update),
      map((data) => ({
        body: {
          success: true,
          message: `recipe sucessfully updated, need approval`,
          data: { ...data, ingredients: JSON.parse(data.ingredients) }
        }
      })),
      catchError((err) => throwError(() => err))
    )
  )
)

const active$ = r.pipe(
  r.matchPath('/:id/active'),
  r.matchType('PATCH'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map((req) => canHandle(req)),
      map((req: any) => ({ id: Number(req.params.id), fields: { published: true } })),
      mergeMap(Recipes.update),
      map((data) => ({
        body: {
          success: true,
          message: `recipe active`,
          data: { ...data, ingredients: JSON.parse(data.ingredients) }
        }
      })),
      catchError((err) => throwError(() => err))
    )
  )
)

const show$ = r.pipe(
  r.matchPath('/:id'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => Number(req.params.id)),
      mergeMap(Recipes.show),
      map((data) => ({
        body: {
          success: true,
          data: { ...data, ingredients: JSON.parse(data.ingredients) }
        }
      }))
    )
  )
)

const showMany$ = r.pipe(
  r.matchPath('/'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      map((req: any) => ({
        ...req.query
      })),
      mergeMap(Recipes.showMany),
      map((data) => ({
        body: {
          success: true,
          data: data.result.map((recipe) => ({
            ...recipe,
            ingredients: JSON.parse(recipe.ingredients)
          })),
          limit: data.limit,
          page: data.page
        }
      }))
    )
  )
)

export const recipes$ = combineRoutes('/recipes', [
  create$,
  delete$,
  update$,
  show$,
  showMany$,
  active$
])
