/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {tsconfig: '<rootDir>/tsconfig.jest.json'}],
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/helpers.ts', 'src/devices/CompliancePolicyAssignment.ts', 'src/devices/ConfigurationPolicy.ts', 'src/devices/ConfigurationPolicyAssignment.ts', 'src/devices/CustomPolicy.ts', 'src/devices/DeviceCatalogs.ts', 'src/devices/MacCompliancePolicy.ts'],
  coverageDirectory: 'coverage',
};
