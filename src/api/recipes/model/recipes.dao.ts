import { prisma } from '@prisma-main'
import { Recipe } from '@prisma/client'
import { from, map, Observable } from 'rxjs'
import { HttpError } from '@marblejs/http'

interface IQuery {
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
    const mountSearch = (search: string) => {
      const contains: string[] = []
      const notContains: string[] = []

      search.split(',').forEach((value) => {
        if (value[0] === '!') notContains.push(value.replace('!', ''))
        else contains.push(value)
      })

      return `${contains.map((value) => `'${value}'`).join(' | ')} & (${notContains
        .map((value) => `!'${value}'`)
        .join(' & ')})`
    }

    const search = mountSearch(query.search)

    const results = from(
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
    )

    return {
      results,
      limit: query.limit,
      page: query.page === 0 ? 1 : query.page - 1
    }
  },

  remove(id: number) {
    return from(prisma.recipe.update({ where: { id }, data: { deletedAt: new Date() } }))
  }
}

//map((id) =>
