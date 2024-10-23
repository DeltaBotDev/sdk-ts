import { build, context } from 'esbuild';
import alias from './alias.js';
import path from 'path';

const isWatching = process.argv.includes('--watch');

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const buildConfig = {
  banner: {
    js: '"use client";',
  },
  bundle: true,
  platform: 'browser',
  target: 'es2015',
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl',
    '.woff2': 'file',
    '.ttf': 'file',
  },
  drop: process.env.NODE_ENV !== 'development' ? ['console', 'debugger'] : [],
  plugins: [
    alias({
      '@': path.resolve(__dirname, '../src'),
    }),
    {
      name: 'external',
      setup(build) {
        let filter = /^[^./]|^\.[^./]|^\.\.[^/]/;
        build.onResolve({ filter }, (args) => ({
          external: true,
          path: args.path,
        }));
      },
    },
  ],
  entryPoints: ['src/lib/index.ts'],
  tsconfig: './tsconfig.json',
  minify: false,
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  external: [],
};

const getConfig = (format, outdir, splitting) => ({
  ...buildConfig,
  format,
  outdir,
  splitting,
});

const buildESM = build(getConfig('esm', 'esm', true));
const buildCJS = build(getConfig('cjs', 'dist', false));

Promise.all([buildESM, buildCJS])
  .then(async () => {
    if (isWatching) {
      console.log('Starting watch mode...');

      const ctxESM = await context(getConfig('esm', 'esm', true));
      const ctxCJS = await context(getConfig('cjs', 'dist', false));

      await ctxESM.watch();
      await ctxCJS.watch();
    } else {
      console.log('Build success...');
    }
  })
  .catch(() => process.exit(1));
