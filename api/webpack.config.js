const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    path: join(__dirname, '../dist/api'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  watchOptions: {
    aggregateTimeout: 5000,
    poll: false,
    ignored: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/tmp/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/database.sqlite',
      '**/database.sqlite-journal',
      '**/database.sqlite-wal',
      '**/database.sqlite-shm',
      '**/.nx/**',
      '**/logs/**',
      '**/*.log',
      '**/apps/dashboard/**'
    ],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
      watch: false,
    }),
  ],
};
