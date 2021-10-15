//import Cjs from "rollup-plugin-cjs-es";
import CommonJs from "@rollup/plugin-commonjs";
import Json from "@rollup/plugin-json";
import NodeResolve from "@rollup/plugin-node-resolve";
import Regex from "rollup-plugin-re";
import Replace from "@rollup/plugin-replace";
import Typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

// NOTE: this config includes a hacky fixes to handle circular dependencies
// https://github.com/rollup/rollup/issues/1507#issuecomment-340550539
// https://github.com/rollup/rollup/issues/2747#issuecomment-507676912

export default {
  input: "./src/index.ts",
  output: [{
    file: pkg.main,
    format: "cjs",
    sourcemap: true,
  }],
  onwarn: (warning, warn) => {
    // Ignore known warnings
    const fromPkg = (pkgName) => warning?.id?.startsWith(`/root/node_modules/${pkgName}`);
    if (warning.code === "EVAL" && fromPkg("depd")) return;
    warn(warning);
  },
  external: ["readable-stream", "readable-stream/transform", "electron"],
  plugins: [
    NodeResolve({
      exportConditions: ["node"],
      preferBuiltins: true,
    }),
    Replace({
      delimiters: ["", ""],
      preventAssignment: true,
      values: {
        "require('readable-stream/transform')": "require('stream').Transform",
        'require("readable-stream/transform")': 'require("stream").Transform',
        "readable-stream": "stream"
      }
    }),
    Json({ compact: true }),
    Regex({ patterns: [{
      match: /types\.js$/,
      test: /util\.emptyArray/,
      replace: "Object.freeze ? Object.freeze([]) : []"
    },
    {
      match: /root\.js/,
      test: /util\.path\.resolve/,
      replace: "require('@protobufjs/path').resolve"
    }] }),
    Typescript({
      outputToFilesystem: true,
      tsconfig: "./tsconfig.json",
    }),
    // Cjs({ nested: true }),
    CommonJs({
      include: ["./src/index.ts", /node_modules/],
      transformMixedEsModules: true,
    }),
  ],
};
