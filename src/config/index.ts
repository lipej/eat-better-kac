require('dotenv').config()

export enum NodeEnv {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'testing'
}

interface IConfig {
  env: NodeEnv
  server: {
    port: number
  }
  jwt: {
    secret: string
    expires: number
  }
}

export const Config: IConfig = {
  env: process.env.APP_ENV as NodeEnv,
  server: {
    port: Number(process.env.PORT) || 3000
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret_test',
    expires: Number(process.env.JWT_EXPIRATION) || 4
  }
}
