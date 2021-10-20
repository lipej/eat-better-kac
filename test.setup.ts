import { createHttpTestBed, createTestBedSetup } from '@marblejs/testing'
import { listener } from '@app'

const testBed = createHttpTestBed({
  listener
})

export const useTestBedSetup = createTestBedSetup({
  testBed
})
