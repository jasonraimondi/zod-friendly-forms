// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  packageManager: "pnpm",
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: {
      test: true,
    },
  },
  compilerOptions: {
    lib: ["es2021", "dom", "dom.iterable"],
  },
  mappings: {
    "https://deno.land/x/zod@v3.22.4/mod.ts": {
      name: "zod",
      version: "^3.22.4",
      peerDependency: true,
    },
  },
  package: {
    name: "zod-ff",
    version: Deno.args[0]?.replace("v", ""),
    description: "Zod Friendly Forms. Form validation for humans.",
    keywords: ["zod", "zod-plugin", "zod-form-parser"],
    author: "Jason Raimondi <jason@raimondi.us>",
    license: "MIT",
    engines: {
      node: ">=18.0.0",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/allmyfutures/zod-friendly-forms.git",
    },
    bugs: {
      url: "https://github.com/allmyfutures/zod-friendly-forms/issues",
    },
    devDependencies: {
      zod: "^3.22.4",
    },
  },
});

// ensure the test data is ignored in the `.npmignore` file
// so it doesn't get published with your npm package
await Deno.writeTextFile(
  "npm/.npmignore",
  "esm/testdata/\nscript/testdata/\n",
  { append: true },
);

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
