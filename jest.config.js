/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {tsconfig: '<rootDir>/tsconfig.jest.json'}],
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/__tests__/**', '!src/**/index.ts', '!src/**/types.ts'],
  coverageDirectory: 'coverage',
  // Jest scopes "global" to files NOT matched by any other threshold key below, so this
  // floor covers src/*.ts and src/base/* only (top-level components — DeviceConfiguration.ts,
  // DeviceCustomConfiguration*.ts, IntuneManagement.ts, BaseComponent.ts — are untested,
  // out of this cycle's scope; PULUMI-TEST-001 covers devices/base providers and payload
  // helpers only). src/devices/** gets the 80% floor the cycle actually asks for; every
  // file there already clears it.
  coverageThreshold: {
    global: {statements: 26.89, branches: 25, functions: 17.64, lines: 27.06},
    'src/devices/**/*.ts': {statements: 80, branches: 80, functions: 80, lines: 80},
  },
};
