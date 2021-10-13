import { prisma } from '@prisma-main'
import { Recipe } from '@prisma/client'
import { from, map, Observable } from 'rxjs'
import { HttpError } from '@marblejs/http'

import { mountSearch } from '@recipes'

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
        if (!recipe.published) throw new HttpError('Can not delete a recipe not published', 400)
        if (recipe.deletedAt) throw new HttpError('Recipe already deleted', 400)

        return recipe
      })
    )
  },

  showMany(query: IQuery) {
    const search = mountSearch(query.search)

    return from(
      prisma.recipe.findMany({
        where: {
          title: { search },
          time: { search },
          ingredients: { search }
        },
        include: { author: true, photos: true },
        take: query.limit,
        skip: query.limit * query.page
      })
    ).pipe(
      map((result) => ({
        result,
        limit: query.limit,
        page: query.page === 0 ? 1 : query.page - 1
      }))
    )
  },

  remove(id: number) {
    return from(prisma.recipe.update({ where: { id }, data: { deletedAt: new Date() } }))
  },

  update(data: { id: number; fields: Omit<IRecipeData, 'authorId'> & { published: boolean } }) {
    return from(
      prisma.recipe.update({
        where: { id: data.id },
        data: { ...data.fields, updatedAt: new Date() }
      })
    )
  }
}
