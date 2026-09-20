import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/tests/**/*.test.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};

const fn = createJestConfig(customJestConfig);

export default async () => {
  const config = await fn();
  config.transformIgnorePatterns = ["node_modules/(?!(@prisma)/)"];
  return config;
};
