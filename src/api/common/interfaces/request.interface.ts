export interface LoginCredentials {
  login: string
  password: string
}

export interface UserCreation {
  email: string
  password: string
  name: string
}

export interface RecipeCreation {
  title: string
  ingredients: string
  preparation: string
  time: string
}
