import { getIdFromToken } from '@auth'
import { RecipeCreation, IRecipeData } from '@common'

export const mountData = (data: { body: RecipeCreation; token: string }): IRecipeData => {
  return { ...data.body, authorId: getIdFromToken(data.token) }
}
