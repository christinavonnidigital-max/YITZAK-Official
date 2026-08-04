import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // Emulator round-trips are slower than unit tests.
    testTimeout: 15000,
    hookTimeout: 30000,
    // Rules tests share a single emulator; run them serially to keep
    // clearFirestore() between tests deterministic.
    fileParallelism: false,
  },
});
