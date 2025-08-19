# AI Development Rules

This document outlines the technology stack and specific library usage guidelines for this Next.js application. Adhering to these rules will help maintain consistency, improve collaboration, and ensure the AI assistant can effectively understand and modify the codebase.

## Tech Stack Overview

The application is built using the following core technologies:

- **Framework**: Next.js (App Router)
  
- **Containerization**: Docker & Docker Compose for local development and consistent environments.
  
- **Container Registry**: GitHub Container Registry (GHCR) for hosting Docker images.
  
- **Language**: TypeScript
  
- **UI Components**: Shadcn/UI - A collection of re-usable UI components built with Radix UI and Tailwind CSS.
  
- **Styling**: Tailwind CSS - A utility-first CSS framework for rapid UI development.
  
- **Icons**: Lucide React - A comprehensive library of simply beautiful SVG icons.
  
- **Forms**: React Hook Form for managing form state and validation, typically with Zod for schema validation.
  
- **Database**: JSON database (`lowdb`) - A lightweight, file-based database that runs entirely in JavaScript.
  
- **State Management**: Primarily React Context API and built-in React hooks (`useState`, `useReducer`).
  
- **Notifications/Toasts**: Sonner for displaying non-intrusive notifications.
  
- **Charts**: Recharts for data visualization.
  
- **Animation**: `tailwindcss-animate` and animation capabilities built into Radix UI components.
  
- **API Proxying**: Next.js Rewrites for handling external API integrations and bypassing CORS.
  

## Library Usage Guidelines

To ensure consistency and leverage the chosen stack effectively, please follow these rules:

1. **UI Components**:
  
  - **Primary Choice**: Always prioritize using components from the `src/components/ui/` directory (Shadcn/UI components).
    
  - **Custom Components**: If a required component is not available in Shadcn/UI, create a new component in `src/components/` following Shadcn/UI's composition patterns (i.e., building on Radix UI primitives and styled with Tailwind CSS).
    
  - **Avoid**: Introducing new, third-party UI component libraries without discussion.
    
2. **Styling**:
  
  - **Primary Choice**: Exclusively use Tailwind CSS utility classes for all styling.
    
  - **Global Styles**: Reserve `src/app/globals.css` for base Tailwind directives, global CSS variable definitions, and minimal base styling. Avoid adding component-specific styles here.
    
  - **CSS-in-JS**: Do not use CSS-in-JS libraries (e.g., Styled Components, Emotion).
    
3. **Icons**:
  
  - **Primary Choice**: Use icons from the `lucide-react` library.
4. **Forms**:
  
  - **Management**: Use `react-hook-form` for all form logic (state, validation, submission).
    
  - **Validation**: Use `zod` for schema-based validation with `react-hook-form` via `@hookform/resolvers`.
    
5. **Database (JSON Database with `lowdb`)**:
  
  - **Integration**: Interact with the JSON database directly using the **`lowdb` library** via the utility functions in `src/lib/database.ts`.
    
  - **Schema**: Database structure (e.g., the `examples` array) is defined and initialized within `src/lib/database.ts`. All data structures (tables/collections) should be defined within the `DbSchema` interface in `src/lib/database.ts`.
    
  - **Persistence**: Any changes to the database (adding, updating, deleting data by modifying `db.data`) **must be explicitly persisted to the `db.json` file by calling `await db.write()`** after the modification.
    
  - **Initialization**: The `db.json` file and its initial structure (`{ examples: [] }`) are automatically created with default empty data when the application first starts, so no manual database setup commands are required.
    
  - **Database File**: The `db.json` file is expected to reside in the `/app/data/` directory (or a directory specified by `DATABASE_DIR` environment variable) within the Docker container for persistence via volume mapping.
    
6. **State Management**:
  
  - **Local State**: Use React's `useState` and `useReducer` hooks for component-level state.
    
  - **Shared/Global State**: For state shared between multiple components, prefer React Context API.
    
  - **Complex Global State**: If application state becomes significantly complex, discuss the potential introduction of a dedicated state management library (e.g., Zustand, Jotai) before implementing.
    
7. **Routing**:
  
  - Utilize the Next.js App Router (file-system based routing in the `src/app/` directory).
8. **API Calls & Data Fetching**:
  
  - **Client-Side**: Use the native `fetch` API or a simple wrapper around it.
    
  - **Server-Side (Next.js)**: Leverage Next.js Route Handlers (in `src/app/api/`) or Server Actions for server-side logic and data fetching.
    
  - **External API Proxying**: When interacting with external APIs that have CORS issues, route requests through Next.js API Rewrites as configured in `next.config.ts` (e.g., `/api/service1/*`). Avoid direct client-side calls to external APIs without proxying unless explicitly necessary.
    
9. **Animations**:
  
  - Use `tailwindcss-animate` plugin and the animation utilities provided by Radix UI components.
10. **Notifications/Toasts**:
  
  - Use the `Sonner` component (from `src/components/ui/sonner.tsx`) for all toast notifications.
11. **Charts & Data Visualization**:
  
  - Use `recharts` and its associated components (e.g., `src/components/ui/chart.tsx`) for displaying charts.
12. **Utility Functions**:
  
  - General-purpose helper functions should be placed in `src/lib/utils.ts`.
    
  - Ensure functions are well-typed and serve a clear, reusable purpose.
    
13. **Custom Hooks**:
  
  - Custom React hooks should be placed in the `src/hooks/` directory (e.g., `src/hooks/use-mobile.tsx`).
14. **TypeScript**:
  
  - Write all new code in TypeScript.
    
  - Strive for strong typing and leverage TypeScript's features to improve code quality and maintainability. Avoid using `any` where possible.
    
15. **Environment Variables for Dyad Testing**:
  
  - For testing and development within the Dyad environment, users can set environment variables directly through the Dyad UI. These variables will be available to the running Next.js application, including those used for API proxying (e.g., `EXTERNAL_API_URL_SERVICE1`) and database paths (`DATABASE_DIR`). This allows for quick iteration before pushing to a Docker-based deployment.

By following these guidelines, we can build a more robust, maintainable, and consistent application within the Dockerized Next.js ecosystem.
