import { defineConfig } from '@prisma/cli';

export default defineConfig({
  datasources: {
    db: {
      // Use DATABASE_URL from environment for generator/runtime
      url: process.env.DATABASE_URL
    }
  }
});

