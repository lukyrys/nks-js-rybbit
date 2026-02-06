import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["cjs", "esm"],
    target: "es2017",
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".esm.js" : ".js",
      };
    },
  },
  {
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["iife"],
    target: "es2017",
    globalName: "NksRybbit",
    sourcemap: true,
    minify: false,
    outExtension() {
      return { js: ".iife.js" };
    },
  },
  {
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["iife"],
    target: "es2017",
    globalName: "NksRybbit",
    sourcemap: true,
    minify: true,
    outExtension() {
      return { js: ".iife.min.js" };
    },
  },
]);
