import { prisma } from '@prisma-main'
import { Recipe } from '@prisma/client'
import { from, map, mergeMap, Observable } from 'rxjs'

import { mountSearch } from '@recipes'
import { HttpError } from '@marblejs/http'

type IQuery = {
  page: number
  limit: number
  search: string
}

type IRecipeData = Omit<Recipe, 'id' | 'published' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export const Recipes = {
  create(recipe: IRecipeData): Observable<Recipe> {
    return from(prisma.recipe.create({ data: recipe }))
  },

  show(id: number) {
    return from(prisma.recipe.findUnique({ where: { id } })).pipe(
      map((recipe) => {
        if (!recipe) throw new HttpError('Recipe not found', 404)

        return recipe
      })
    )
  },

  showMany(query: IQuery) {
    const search = mountSearch(query.search)
    const page = query.page ? Number(query.page - 1) : 0
    const limit = query.limit ? Number(query.limit) : 10
    return from(
      prisma.recipe.findMany({
        where: search as any,
        include: {
          author: { select: { name: true } }
        },
        take: limit,
        skip: limit * page
      })
    ).pipe(
      map((result) => ({
        result,
        limit: limit,
        page: page === 0 ? 1 : page + 1
      }))
    )
  },

  remove(data: { id: number }) {
    return from(prisma.recipe.findUnique({ where: { id: data.id } })).pipe(
      map((recipe) => {
        if (!recipe) throw new HttpError('Recipe not found', 404)
        return recipe.id
      }),
      mergeMap((id) =>
        prisma.recipe.update({ where: { id }, data: { deletedAt: new Date(), published: false } })
      )
    )
  },

  update(data: { id: number; fields: Partial<IRecipeData> & { published: boolean } }) {
    return from(prisma.recipe.findUnique({ where: { id: data.id } })).pipe(
      map((recipe) => {
        if (!recipe) throw new HttpError('Recipe not found', 404)
        return recipe.id
      }),
      mergeMap((id) =>
        prisma.recipe.update({
          where: { id },
          data: { ...data.fields, updatedAt: new Date(), published: data.fields.published || false }
        })
      )
    )
  }
}
