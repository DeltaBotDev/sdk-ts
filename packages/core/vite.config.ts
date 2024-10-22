import { defineConfig } from 'vite';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    nodePolyfills(),
    dts({
      rollupTypes: true,
      copyDtsFiles: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'DeltaTrade',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : format + '.js'}`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {},
    outDir: 'dist',
    emptyOutDir: true,
  },
});
