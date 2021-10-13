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

  it('should get error when try to delete without token', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(request('DELETE'), request.withPath('/api/users'), request.send)

    expect(response.statusCode).toBe(401)
    expect(response.body.error.message).toBe(`Unauthorized`)
  })

  it('should get error when try to delete with invalid token', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('DELETE'),
      request.withPath('/api/users'),
      request.withHeaders({
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTAsInJvbGUiOiJVU0VSIiwiZXhwIjoxNjMzODU0Njc4LCJpYXQiOjE2MzM4NDAyNzh9.Bw_lDmqwvSVcOO1C59KevKFD5nCeN4kPk1btwfbpvLg`
      }),
      request.send
    )

    expect(response.statusCode).toBe(401)
    expect(response.body.error.message).toBe(`Unauthorized`)
  })

  it('should delete a user sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const token = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ login: 'test@example.com', password: 'test' }),
      request.send
    ).then((response) => response.body.token)

    const response = await pipe(
      request('DELETE'),
      request.withPath('/api/users'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: `user deleted, you can't login anymore`
    })
  })
})
