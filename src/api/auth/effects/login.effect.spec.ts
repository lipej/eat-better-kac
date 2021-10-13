import { prisma } from '@prisma-main'
import { pipe } from 'fp-ts/lib/function'
import * as bcrypt from 'bcryptjs'

import { useTestBedSetup } from '@tests'

describe('login$', () => {
  const testBedSetup = useTestBedSetup()

  beforeAll(async () => {
    await prisma.user.createMany({
      data: [
        { name: 'user1', email: 'teste1@teste.com', password: bcrypt.hashSync('123456') },
        { name: 'user2', email: 'teste2@teste.com', password: bcrypt.hashSync('123457') }
      ]
    })
  })

  it('should login sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('POST'),
      request.withPath('/auth'),
      request.withBody({ login: 'teste1@teste.com', password: '123456' }),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')

    await testBedSetup.cleanup()
  })

  it('should not login sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('POST'),
      request.withPath('/auth'),
      request.withBody({ login: 'teste2@teste.com', password: '123456' }),
      request.send
    )

    expect(response.statusCode).toBe(401)

    await testBedSetup.cleanup()
  })
})
