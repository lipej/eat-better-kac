import { prisma } from '@prisma-main'
import { User } from '@prisma/client'
import { from, Observable, map } from 'rxjs'
import * as bcrypt from 'bcryptjs'

import { LoginCredentials } from '@auth'
import { UserCreation } from '@users'

export const NOT_FOUND_USER = 'User not found'

export const Users = {
  validate(id: number): Observable<User | null> {
    return from(
      prisma.user.findUnique({
        where: {
          id
        }
      })
    )
  },

  findByCredentials(credentials: LoginCredentials): Observable<User> {
    return from(
      prisma.user.findUnique({
        where: {
          email: credentials.email
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
  }
}
