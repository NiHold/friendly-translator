// jest.config.js (ESM)
export default {
  testEnvironment: "node",
  transform: {},
  collectCoverage: true,
  collectCoverageFrom: ["src/api/**/*.{js,jsx}"],
  coverageReporters: ["text", "lcov"],
};
