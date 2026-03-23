# Project Overview

A React + TypeScript + Vite frontend application built with shadcn/ui components and Tailwind CSS. Originally created in Lovable, migrated to Replit.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 8
- **Styling**: Tailwind CSS, shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **State/Data**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion

## Project Structure

```
src/
  App.tsx          - Root app with routing and providers
  main.tsx         - Entry point
  pages/           - Page-level components (Index, NotFound)
  components/      - Reusable UI components (shadcn/ui + custom)
  hooks/           - Custom React hooks
  lib/             - Utility functions
  assets/          - Static assets
```

## Running the App

```bash
npm run dev       # Start dev server on port 5000
npm run build     # Build for production
npm run preview   # Preview production build
```

## Notes

- `lovable-tagger` dev dependency was removed as it conflicts with Vite 8 and is Lovable-specific
- Vite dev server is configured to bind to `0.0.0.0:5000` for Replit compatibility
- `allowedHosts: true` is set for Replit's proxied preview pane
