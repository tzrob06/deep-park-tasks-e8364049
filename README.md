# DEEP Park Task Management System

A centralized operational web application designed for Department of Energy and Environmental Protection (DEEP) personnel to streamline park maintenance, track field tasks, facilitate crew communications, and maintain infrastructure across state park facilities.

*Developed with [Lovable](https://lovable.dev).*

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Configuration & Environment](#configuration--environment)
- [Development](#development)

---

## Overview

The DEEP Park Task Management System provides park supervisors, field crews, and administrative personnel with a structured interface for monitoring maintenance workflows, prioritizing urgent repairs, documenting field conditions through photography, and recording daily operational logs.

---

## Key Features

- **Multi-Park Dashboard & Selector**: Intuitive navigation across designated park facilities with dedicated task boards per location.
- **Task Lifecycle Management**: End-to-end task tracking with status filtering (Pending, In Progress, Completed), category classification, and urgency indicators.
- **Crew Logs & Daily Notes**: Integrated field communications allowing staff to document shift notes, weather observations, and equipment statuses.
- **Photo Documentation & Asset Library**: Visual attachment support for pre- and post-maintenance verification and facility reporting.
- **Standard Task Library**: Pre-configured task templates and operational checklists for routine seasonal maintenance.
- **Administrative Controls**: Dedicated administrative portal for managing park metadata, operational zones, and user configurations.

---

## Technology Stack

### Core Framework & Runtime
- **Runtime / Package Management**: [Node.js](https://nodejs.org/) / [Bun](https://bun.sh/)
- **Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Routing & Server Engine**: [TanStack Start](https://tanstack.com/start/latest) & [TanStack Router](https://tanstack.com/router/latest)
- **State & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)

### User Interface & Styling
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives & [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Development & Tooling
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Code Quality**: [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)

---

## Project Structure

```text
├── public/                # Static public assets
├── src/
│   ├── components/        # Reusable UI components & modals
│   │   ├── ui/            # Base Radix/shadcn design system components
│   │   ├── AdminModal.tsx # Administrative management modal
│   │   ├── CrewNotesSection.tsx # Field notes & daily logs
│   │   ├── ParkPicker.tsx # Park selector interface
│   │   └── SiteHeader.tsx # Application navigation and brand header
│   ├── data/              # Default mock data and seed records
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and helper libraries
│   ├── routes/            # TanStack file-based application routes
│   │   ├── __root.tsx     # Root layout shell
│   │   ├── index.tsx      # Main task board view
│   │   ├── library.tsx    # Task template library
│   │   └── photos.tsx     # Facility photo gallery
│   ├── router.tsx         # Router configuration
│   ├── server.ts          # Server-side entry point
│   ├── start.ts           # TanStack Start bootstrap
│   └── styles.css         # Global stylesheet & design tokens
├── package.json           # Project manifest and dependencies
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite build configuration
```

---

## Getting Started

### Prerequisites

Ensure the following runtimes and tools are installed on your environment:
- **Node.js**: Version `20.x` or higher (or **Bun** `1.x+`)
- **npm**, **pnpm**, or **bun** package manager

### Installation

1. Clone the repository to your local workstation:
   ```bash
   git clone https://github.com/tzrob06/deep-park-tasks-e8364049.git
   cd deep-park-tasks-e8364049
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Application

To launch the local development server with hot-module replacement (HMR):

```bash
npm run dev
```

By default, the application will initialize and serve at `http://localhost:8080` (or `http://localhost:3000` when running via containerized Base44 environments).

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server with HMR. |
| `npm run build` | Compiles and optimizes the application for production deployment. |
| `npm run preview` | Starts a local server to preview the production build. |
| `npm run lint` | Runs ESLint to identify code quality and style issues. |
| `npm run format` | Executes Prettier to format source files across the repository. |

---

## Configuration & Environment

- **Server Port Configuration**: The TanStack Start dev wrapper is configured to bind to port `8080`.
- **Client-Side Hydration**: Initial server responses deliver a lightweight shell that hydrates local state and storage on initial client mount.

---

## Development

This application was developed with [Lovable](https://lovable.dev).
