import * as esbuild from 'esbuild'
import { execSync } from 'child_process'

// Generate types
console.log('Generating type declarations...')
execSync('tsc --emitDeclarationOnly --outDir dist', { stdio: 'inherit' })

// ESM build
console.log('Building ESM...')
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: ['es2020'],
  sourcemap: true,
  minify: true,
  treeShaking: true
})

// CJS build (for Node.js)
console.log('Building CJS...')
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: ['es2020'],
  sourcemap: true,
  minify: true,
  treeShaking: true
})

// Browser bundle
console.log('Building browser bundle...')
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/nifti-stream.js',
  bundle: true,
  format: 'iife',
  globalName: 'niftiStream',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  minify: true,
  treeShaking: true
})

console.log('Build complete!')