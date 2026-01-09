import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    entry: 'src/index.ts',
    output: 'dist/types'
  },
  sourcemap: true,
  clean: true,
  target: 'node16'
});
