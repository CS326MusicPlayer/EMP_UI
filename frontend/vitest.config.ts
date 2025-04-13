import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['**/node_modules/**', 'src/index.tsx', 'src/main.tsx', '**/*.d.ts'],
      },
      css: {
        modules: {
          classNameStrategy: 'non-scoped',
        },
      },
    },
  })
);
