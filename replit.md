# Scoreboard Overlay Application

## Overview

This is a real-time scoreboard overlay application designed for live sports video streaming. The system enables remote control of scoreboard displays through WebSocket-based real-time communication. Users can operate the scoreboard from a remote control interface while the scoreboard overlay displays over video content with customizable layouts, team colors, and scores.

The application supports multiple match configurations simultaneously, with each match identified by a unique match ID. The scoreboard is optimized for instant readability with high contrast, bold typography, and clean separation between elements - critical for live event broadcasting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: Shadcn/ui components built on Radix UI primitives
- Utility-first styling with Tailwind CSS
- Custom design system optimized for scoreboard readability
- Theme support via CSS variables (light/dark modes)
- Responsive layouts for mobile and desktop

**State Management**:
- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- WebSocket hook for real-time updates

**Routing**: Wouter for client-side routing
- Home page: Match ID selection interface
- Remote control page: Score and configuration management
- Scoreboard page: Display overlay with configurable layouts

**Real-time Communication**: Custom WebSocket hook (`useWebSocket`) manages:
- Automatic reconnection with exponential backoff
- Match subscription by ID
- Bidirectional updates between remote and display
- Connection status tracking

### Backend Architecture

**Runtime**: Node.js with Express framework

**API Design**: REST + WebSocket hybrid architecture
- REST endpoints for match CRUD operations
- WebSocket server for real-time score updates and configuration changes
- Match-specific broadcasting to connected clients

**Server Implementation**:
- Express middleware for JSON parsing and request logging
- HTTP server wrapping Express for WebSocket upgrade support
- Custom middleware tracks request duration and response payloads

**WebSocket Broadcasting**: Server maintains client subscriptions by match ID and broadcasts updates only to relevant clients

### Data Storage

**Current Implementation**: In-memory storage (`MemStorage` class)
- Map-based storage of match configurations
- No persistence between server restarts
- Suitable for development and single-instance deployments

**Prepared for Database Migration**: 
- Storage abstraction layer via `IStorage` interface
- Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless`)
- Schema definition ready in `shared/schema.ts`
- Database migration support configured with Drizzle Kit

**Data Model** (`MatchConfig`):
- Match identification and layout settings
- Team configurations (names, colors, scores, serving status)
- Font customization options
- Validated with Zod schemas for type safety

### External Dependencies

**UI Framework**:
- React 18+ with TypeScript
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Lucide React for icons

**Backend Services**:
- Express.js for HTTP server
- ws (WebSocket library) for real-time communication
- Vite for development server with HMR

**Database Preparation**:
- Drizzle ORM for type-safe database operations
- @neondatabase/serverless for PostgreSQL connection
- connect-pg-simple for session storage (configured but not actively used)

**Development Tools**:
- TypeScript for type safety across client, server, and shared code
- Zod for runtime validation and type inference
- tsx for TypeScript execution in development

**Build Tools**:
- Vite for frontend bundling and development
- esbuild for backend bundling in production
- PostCSS with Autoprefixer for CSS processing

**Validation & Type Safety**:
- Shared schemas between client and server via `@shared` alias
- Zod schemas define and validate match configurations
- drizzle-zod bridges database schemas with Zod validation

**Design System**: Custom scoreboard-focused design with:
- Inter/Roboto fonts for high legibility
- Tailwind spacing primitives (2, 4, 6, 8, 12)
- Three layout modes: side-by-side, stacked, scoreboard
- Instant readability optimizations for live events