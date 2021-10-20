import { pipe } from 'fp-ts/lib/function'

import { useTestBedSetup } from '@tests'
import { prisma } from '@prisma-main'
import * as bcrypt from 'bcryptjs'

describe('recipes$', () => {
  const testBedSetup = useTestBedSetup()

  afterEach(async () => {
    await testBedSetup.cleanup()
  })

  beforeAll(async () => {
    await prisma.user.createMany({
      data: [
        {
          name: 'Test User',
          email: 'test@test',
          password: bcrypt.hashSync('test')
        },
        {
          name: 'Admin User',
          email: 'admin@test',
          password: bcrypt.hashSync('admin'),
          role: 'ADMIN'
        }
      ]
    })

  })

  it('should create a recipe sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'test@test', password: 'test' }),
      request.send
    )

    const response = await pipe(
      request('POST'),
      request.withPath('/api/recipes'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.withBody({
        title: 'test recipe 1',
        ingredients: { code: '100g' },
        preparation: 'mix all together, put in the oven',
        time: '100m'
      }),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe(`recipe sucessfully created, wait for admin publish it`)
  })

  it('should get error when try to create a recipe withou body', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'test@test', password: 'test' }),
      request.send
    )

    const response = await pipe(
      request('POST'),
      request.withPath('/api/recipes'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.send
    )

    expect(response.statusCode).toBe(400)
  })

  it('should not active a recipe when is user', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'test@test', password: 'test' }),
      request.send
    )

    const response = await pipe(
      request('PATCH'),
      request.withPath('/api/recipes/1/active'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.send
    )

    expect(response.statusCode).toBe(401)
  })

  it('should not active a recipe with invalid token', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('PATCH'),
      request.withPath('/api/recipes/1/active'),
      request.withHeaders({ Authorization: `Bearer DASDSSA5sd5d1s5ad` }),
      request.send
    )

    expect(response.statusCode).toBe(401)
  })

  it('should active a recipe when is admin', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'admin@test', password: 'admin' }),
      request.send
    )

    const response = await pipe(
      request('PATCH'),
      request.withPath('/api/recipes/1/active'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data.published).toBe(true)
  })

  it('should get error when try to active a recipe not found', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'admin@test', password: 'admin' }),
      request.send
    )

    const response = await pipe(
      request('PATCH'),
      request.withPath('/api/recipes/1000/active'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.send
    )

    expect(response.statusCode).toBe(404)
  })

  it('should get error when try to update a recipe not found', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'admin@test', password: 'admin' }),
      request.send
    )

    const response = await pipe(
      request('PATCH'),
      request.withPath('/api/recipes/1000'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.withBody({ title: 'new recipe test name' }),
      request.send
    )

    expect(response.statusCode).toBe(404)
  })

  it('should update a recipe sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'admin@test', password: 'admin' }),
      request.send
    )

    const create = await pipe(
      request('POST'),
      request.withPath('/api/recipes'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.withBody({
        title: 'test recipe 1',
        ingredients: { code: '100g' },
        preparation: 'mix all together, put in the oven',
        time: '100m'
      }),
      request.send
    )

    const update = await pipe(
      request('PATCH'),
      request.withPath(`/api/recipes/${create.body.data.id}`),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.withBody({ title: 'new recipe test name' }),
      request.send
    )

    expect(update.statusCode).toBe(200)
    expect(create.body.data.title).toBe('test recipe 1')
    expect(update.body.data.title).toBe('new recipe test name')
    expect(update.body.data.published).toBe(false)
  })

  it('should delete a recipe sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'admin@test', password: 'admin' }),
      request.send
    )

    const response = await pipe(
      request('DELETE'),
      request.withPath('/api/recipes/1'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data.deletedAt).toBeDefined()
  })

  it('should get error when trying to delete a recipe not found', async () => {
    const { request } = await testBedSetup.useTestBed()

    const {
      body: { token }
    } = await pipe(
      request('POST'),
      request.withPath('/api/auth'),
      request.withBody({ email: 'admin@test', password: 'admin' }),
      request.send
    )

    const response = await pipe(
      request('DELETE'),
      request.withPath('/api/recipes/1000'),
      request.withHeaders({ Authorization: `Bearer ${token}` }),
      request.send
    )

    expect(response.statusCode).toBe(404)
  })

  it('should get a recipe sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(request('GET'), request.withPath('/api/recipes/1'), request.send)

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toBeDefined()
  })

  it('should get erro when recipe not found', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(request('GET'), request.withPath('/api/recipes/100'), request.send)

    expect(response.statusCode).toBe(404)
  })

  it('should search a recipe sucessfully', async () => {
    await prisma.recipe.createMany({
      data: [
        {
          title: 'Banana Yogurt Cake',
          ingredients: JSON.stringify({
            'white suggar': '3/4 cup',
            'melted butter': '1/2 cup',
            eggs: '2',
            banana: '2 medium'
          }),
          preparation: 'combine all together, bake',
          time: '120m',
          published: true,
          authorId: 1
        },
        {
          title: 'Vegan Banana Yogurt Cake',
          ingredients: JSON.stringify({
            'white suggar': '3/4 cup',
            'melted butter': '1/2 cup',
            'linseed gel': '1/2 cup',
            banana: '2 medium'
          }),
          preparation: 'combine all together, bake',
          time: '130m',
          published: true,
          authorId: 1
        },
        {
          title: 'Apple Yogurt Cake',
          ingredients: JSON.stringify({
            'white suggar': '3/4 cup',
            'melted butter': '1/2 cup',
            eggs: '1/2 cup',
            apple: '2 big'
          }),
          preparation: 'combine all together, bake',
          time: '120m',
          published: false,
          authorId: 1
        }
      ]})
      
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('GET'),
      request.withPath('/api/recipes?search=Banana&limit=2&page=1'),
      request.send
    )
    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(2)
  })

  it('should search a recipe sucessfully with combineted filters', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('GET'),
      request.withPath('/api/recipes?search=Banana,!egg&limit=2&page=1'),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(1)
  })

  it('should search a recipe sucessfully with negative filters ', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('GET'),
      request.withPath('/api/recipes?search=!egg&limit=2&page=1'),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(1)
  })

  it('should not display recipes not published', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('GET'),
      request.withPath('/api/recipes?search=melted+butter'),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(2)
  })

  it('should get recipes published with pagination', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('GET'),
      request.withPath('/api/recipes?page=2&limit=1'),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(1)
  })

  it('should not get error when dont search anything', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('GET'),
      request.withPath('/api/recipes?search=blablabla'),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(0)
  })

  it('should not get error when page dont have results', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(
      request('GET'),
      request.withPath('/api/recipes?page=20'),
      request.send
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(0)
  })
})
