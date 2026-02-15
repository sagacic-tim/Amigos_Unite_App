*** Amigos Unite App ***

    React + TypeScript frontend for community coordination

** Overview

    Amigos Unite App is a modern, single-page application built with React, TypeScript, and Vite.
    
    It consumes the Amigos Unite API and provides a responsive UI for managing events, locations, and participation.

    The application emphasizes clarity, maintainability, and strong typing over framework complexity.
________________________________

** Core Features

    * User authentication (JWT + cookies)

    * Event creation and editing

    * Location search with Google Places

    * Role-aware UI (coordinator vs participant)

    * Multi-step event forms

    * Responsive layout (mobile → desktop)
________________________________

** Tech Stack

    * Framework: React 18

    * Language: TypeScript

    * Build tool: Vite

    * Styling: SCSS with design tokens

    * HTTP client: Axios

    * Routing: React Router

    * State management: React hooks + context

    * Linting: ESLint (TypeScript-aware)
________________________________

** Development Setup

    npm install
    npm run dev


    The app runs locally with hot module replacement (HMR) via Vite.
________________________________

** Environment Configuration

    API base URL is resolved automatically:

        * Development: https://localhost:3001

        * Production: same-origin (/api/...)

    Optional override:

        VITE_API_BASE_URL=https://api.amigosunite.org

        This avoids common “localhost in production” deployment issues.
________________________________

** Authentication Model

    * JWT tokens stored in memory and localStorage

    * CSRF tokens via secure cookies

    * Automatic token refresh on 401 responses

    * Centralized Axios interceptors for auth handling
________________________________

** Linting & Code Quality

The project is configured for type-aware linting:

    * Strict TypeScript rules

    * Explicit typing of API responses

    * No any in service layers

    * Clear separation of concerns:

        * services/ → API logic

        * components/ → UI

        * pages/ → route composition
________________________________

** Build

npm run build

Outputs a static production bundle suitable for:

    * Nginx

    * CDN hosting

    * Docker containers
________________________________

** Deployment

    * Built automatically via GitHub Actions

    * Published as a container image (GHCR)

    * Deployed behind Nginx on a VPS

    * Uses same-origin API routing in production
________________________________

** Design Philosophy

    * This frontend demonstrates:

    * Real-world React architecture (not a demo toy)

    * Strong TypeScript discipline

    * Clean separation between UI and data access

    * Practical handling of auth, errors, and retries

    * Production-oriented deployment mindset
________________________________

** Why This Matters

Together, Amigos Unite App + API showcase:

    * Full-stack system design

    * Secure auth flows

    * CI/CD pipelines

    * Docker-based deployments

    * Maintainable frontend architecture

They are intentionally structured for evaluation by engineers, not just end users.
________________________________
