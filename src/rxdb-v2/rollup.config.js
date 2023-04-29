// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import typescript2 from 'rollup-plugin-typescript2';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dts from 'rollup-plugin-dts';
// import replace from '@rollup/plugin-replace'

// console.log(dirname(fileURLToPath(import.meta.url)));
export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      nodeResolve(),
      typescript2(),
      commonjs({
        include: 'node_modules/**',
      }),
      // dts(),
    ],
  },
  // {
  //   input: 'src/main.ts',
  //   output: [
  //     {
  //       file: 'dist/main.js',
  //       format: 'cjs',
  //       sourcemap: true,
  //     },
  //   ],
  // plugins: [
  //   json(),
  //   nodeResolve(),
  //   typescript(),
  //   commonjs({
  //     include: './node_modules/**',
  //   }),
  // ],
  // },
];
