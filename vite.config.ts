export default {
  test: {
    coverage: {
      include: ["src/**/*.ts", "!src/**/*.{d,cjs}.ts"],
      reportsDirectory: "coverage",
      reporter: ["text", "lcov", "json"],
    },
  },
};
