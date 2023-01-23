// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: {
      test: true,
    },
    // shim FormData
    undici: true,
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
    peerDependencies: {
      zod: "^3.19.0",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
