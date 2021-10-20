import { pipe } from 'fp-ts/lib/function'

import { useTestBedSetup } from '@tests'

describe('users$', () => {
  const testBedSetup = useTestBedSetup()

  afterEach(async () => {
    await testBedSetup.cleanup()
  })

  it('should create users sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('POST'),
      request.withPath('/api/users'),
      request.withBody({ name: 'test', password: 'test', email: 'test@example.com' }),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: `use test@example.com as username and your password to login`
    })
  })

  it('should not create user with duplicate info', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('POST'),
      request.withPath('/api/users'),
      request.withBody({ name: 'test', password: 'test', email: 'test@example.com' }),
      request.send
    )

    expect(response.statusCode).toBe(400)
    expect(response.body.error.message).toBe(`error creating user`)
  })
})
