import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  bundle: true,
  noExternal: [
    'shunshi-bazi-core',
    'tyme4ts',
    'lunar-javascript',
    '@openfate/true-solar-time',
  ],
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.js' };
  },
});
