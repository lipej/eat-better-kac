const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  coverageDirectory: './coverage/',
  coveragePathIgnorePatterns: ['.d.ts$', 'src/config', 'src/main.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' })
}
