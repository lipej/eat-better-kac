import { pipe } from 'fp-ts/lib/function'
import { useTestBedSetup } from '@tests'

describe('health$', () => {
  const testBedSetup = useTestBedSetup()

  it('should GET /health sucessfully', async () => {
    const { request } = await testBedSetup.useTestBed()

    const response = await pipe(request('GET'), request.withPath('/api/health'), request.send)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ success: true, message: "The oven is hot let's cook..." })

    await testBedSetup.cleanup()
  })
})
