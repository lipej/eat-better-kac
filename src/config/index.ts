require('dotenv').config()

export enum NodeEnv {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development'
}

interface IConfig {
  env: NodeEnv
  server: {
    host: string
    port: number
  }
  jwt: {
    secret: string
    expires: number
  }
}

export const Config: IConfig = {
  env: process.env.NODE_ENV as NodeEnv,
  server: {
    host: process.env.HOST || '127.0.0.1',
    port: Number(process.env.APP_PORT) || 3000
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret_test',
    expires: Number(process.env.JWT_EXPIRATION) || 4
  }
}
