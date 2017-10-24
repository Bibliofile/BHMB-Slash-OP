import string from 'rollup-plugin-string'
import typescript from 'rollup-plugin-typescript2'

export default {
  input: './src/index.ts',
  output: {
    file: 'build/bundle.js',
    format: 'umd',
  },
  plugins: [
    typescript(),
    string({ include: ['**/*.html', '**/*.css', '**/*.txt'] })
  ],

  external: ['@bhmb/bot'],
  globals: { '@bhmb/bot': '@bhmb/bot' }
}