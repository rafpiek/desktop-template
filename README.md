# Zeyn - Writing Editor

A modern writing application built with React, TypeScript, Vite, and Tauri.

## Prerequisites

- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- [PostgreSQL](https://www.postgresql.org/) - Database for data persistence
- [Rust](https://www.rust-lang.org/) - For Tauri desktop app

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up the database:**
   ```bash
   # Start PostgreSQL (varies by system)
   # macOS with Homebrew:
   brew services start postgresql
   
   # Create database
   createdb zeyn_dev
   ```

3. **Configure environment variables:**
   ```bash
   # .env file is already configured with:
   DATABASE_URL="postgresql://postgres@localhost:5432/zeyn_dev"
   
   # Update the connection string if needed for your setup
   ```

4. **Set up Prisma database:**
   ```bash
   # Push schema to database
   bun run db:push
   
   # Or create and run migrations (recommended for production)
   bun run db:migrate
   ```

5. **Start development server:**
   ```bash
   # Web development
   bun run dev
   
   # Tauri desktop app development
   bun run tauri:dev
   ```

## Database Scripts

- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes to database (development)
- `bun run db:migrate` - Create and run database migrations (production)
- `bun run db:studio` - Open Prisma Studio for database management

## Project Structure

- `/src/lib/prisma.ts` - Database client configuration
- `/prisma/schema.prisma` - Database schema definition
- `/src/lib/types/project.ts` - TypeScript interfaces
- `/src/components/` - React components
- `/src/pages/` - Application pages

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
