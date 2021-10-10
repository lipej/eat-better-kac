import { prisma } from '@prisma-main'
import { from, Observable } from 'rxjs'
import * as bcrypt from 'bcryptjs'
import { LoginCredentials, UserCreation } from '@common'
import { User } from '@prisma/client'
import { map } from 'rxjs/operators'

export const NOT_FOUND_USER = 'User not found'

export const Users = {
  validate(id: number): Observable<User> {
    return from(
      prisma.user.findUnique({
        where: {
          id
        }
      })
    ).pipe(
      map((user) => {
        if (!user) throw new Error(NOT_FOUND_USER)

        return user
      })
    )
  },

  findByCredentials(credentials: LoginCredentials): Observable<User> {
    return from(
      prisma.user.findUnique({
        where: {
          email: credentials.login
        }
      })
    ).pipe(
      map((user) => {
        if (user && bcrypt.compareSync(credentials.password, user.password)) return user
        throw new Error(NOT_FOUND_USER)
      })
    )
  },

  create(user: UserCreation): Observable<User> {
    return from(
      prisma.user.create({
        data: { ...user, password: bcrypt.hashSync(user.password) }
      })
    )
  },

  delete(id: number): Observable<Boolean> {
    return from(prisma.user.delete({ where: { id } }).then(() => true))
  }
}
