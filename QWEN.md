# Zeyn - Writing Editor (Code Project)

## Project Overview

Zeyn is a modern writing application designed for writers, built with a contemporary tech stack including React, TypeScript, Vite, and Tauri for desktop deployment. It provides features for managing writing projects, chapters, documents, and tracking writing goals.

### Main Technologies

*   **Frontend:** React 19, TypeScript, Vite
*   **UI Framework:** Custom components, likely using Tailwind CSS (based on dependencies).
*   **Rich Text Editor:** Plate.js
*   **State Management:** React Context API (e.g., `ThemeProvider`, `GoalsProvider`)
*   **Routing:** React Router v7
*   **Backend/Database:** PostgreSQL with Prisma ORM. Prisma Accelerate is used for potential performance optimization.
*   **AI Integration:** Libraries from `@ai-sdk` and `ai` suggest integration with AI providers like OpenAI.
*   **Desktop App:** Tauri v2 for building a desktop application.
*   **Build Tool:** Vite
*   **Package Manager:** Bun

### Architecture

The application follows a typical React/Vite structure. The main entry point is `src/main.tsx`. The core application logic resides in `src/App.tsx`, which uses React Router to define routes for different sections like the home page, editor, projects, goals, and settings.

Data persistence is handled by Prisma, interacting with a PostgreSQL database as defined in `prisma/schema.prisma`. The application defines core entities like `Project`, `Chapter`, and `Document`, each with specific statuses and relationships.

## Building and Running

### Prerequisites

*   Bun (JavaScript runtime)
*   PostgreSQL (Database)
*   Rust (For Tauri desktop app)

### Setup and Development

1.  **Install dependencies:**
    ```bash
    bun install
    ```
2.  **Set up the database:**
    *   Start PostgreSQL.
    *   Create a database named `zeyn_dev`.
    ```bash
    createdb zeyn_dev
    ```
3.  **Configure environment variables:**
    *   The default `DATABASE_URL` is `postgresql://postgres@localhost:5432/zeyn_dev`. Adjust if your PostgreSQL setup differs.
4.  **Set up Prisma database:**
    ```bash
    # Push schema changes to database (development)
    bun run db:push

    # Or create and run migrations (recommended for production/advanced changes)
    bun run db:migrate
    ```
5.  **Start development server:**
    ```bash
    # Web development server (port 5000)
    bun run dev

    # Tauri desktop app development
    bun run tauri:dev
    ```

### Production Build

*   **Web Application:**
    ```bash
    bun run build
    ```
*   **Tauri Desktop Application:**
    ```bash
    bun run tauri:build
    ```

### Database Management Scripts

*   `bun run db:generate` - Generate Prisma client.
*   `bun run db:push` - Push schema changes to database (development).
*   `bun run db:migrate` - Create and run database migrations (production).
*   `bun run db:studio` - Open Prisma Studio for database management.

## Development Conventions

### Project Structure

Key directories and files:

*   `src/`: Main source code.
    *   `main.tsx`: Entry point.
    *   `App.tsx`: Main application component and routing.
    *   `components/`: Reusable UI components.
    *   `pages/`: Top-level page components.
    *   `lib/`: Utility libraries (e.g., Prisma client, types).
    *   `contexts/`: React Context providers.
*   `prisma/schema.prisma`: Database schema definition.
*   `src/lib/types/project.ts`: TypeScript interfaces for core data models (Project, Chapter, Document).
*   `src/lib/prisma.ts`: Prisma client configuration.
*   `vite.config.ts`: Vite build configuration.
*   `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: TypeScript configuration.

### Code Style and Linting

*   TypeScript is used throughout.
*   ESLint is configured for linting. The configuration likely includes recommended rules for TypeScript and React.
*   Consider enabling type-aware lint rules (as suggested in README) for stricter type checking.

### Data Models and Types

*   Core data models (`Project`, `Chapter`, `Document`) are defined in `prisma/schema.prisma` for the database and in `src/lib/types/project.ts` as TypeScript interfaces.
*   The models include statuses (e.g., `draft`, `in-progress`, `completed`), relationships (projects have chapters, chapters have documents), and metadata (word counts, timestamps).
*   Utility functions for creating empty entities and calculating word counts are included in `src/lib/types/project.ts`.

### Styling

*   Tailwind CSS is used for styling, indicated by the presence of `tailwind.config.js` and related dependencies.
*   A custom `ThemeProvider` component handles light/dark/system themes.