const esm = {
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
};

/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  projects: [
    {
      displayName: "client",
      testEnvironment: "jsdom",
      ...esm,
    },
    {
      displayName: "server",
      preset: "ts-jest",
      testEnvironment: "node",
      ...esm,
    },
  ],
};
