import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  bundle: true,
  outExtension: () => ({ js: '.mjs' }),
});
