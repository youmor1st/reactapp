# Overview

An educational platform designed to teach computer literacy basics in Kazakh language. The application provides four core learning modules covering computer hardware, software, file management, and internet browsers. Each module includes comprehensive educational content and a quiz system to test understanding. The platform features user authentication via Replit Auth, progress tracking, and quiz result storage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: Shadcn UI components built on Radix UI primitives
- Design follows Material Design principles combined with modern educational platform patterns
- Component library includes 40+ pre-built UI components (buttons, cards, dialogs, forms, etc.)
- Styling via Tailwind CSS with custom design tokens for colors, spacing, and typography
- Theme system supporting light/dark modes with CSS variables

**Routing**: Wouter for client-side routing
- Landing page for unauthenticated users
- Home dashboard showing module progress
- Individual module content pages
- Quiz pages for each module
- 404 error page

**State Management**: TanStack Query (React Query) for server state
- Centralized query client configuration
- Custom fetch utilities with credential handling
- Automatic query invalidation and refetching disabled for better control

**Language Support**: Full Kazakh language interface
- All UI text, content, and educational materials in Kazakh
- Uses Inter/Noto Sans fonts with excellent Cyrillic support

## Backend Architecture

**Runtime**: Node.js with Express framework

**API Design**: RESTful endpoints
- `/api/auth/*` - Authentication endpoints (Replit Auth integration)
- `/api/modules` - Fetch all modules or specific module by ID
- `/api/questions/:moduleId` - Get questions for a module
- `/api/quiz/submit` - Submit quiz answers and get results
- `/api/progress` - User progress tracking
- `/api/results` - Quiz result history

**Session Management**: Express Session with PostgreSQL store
- 7-day session TTL
- Secure, httpOnly cookies
- Session data persisted in database

**Authentication Strategy**: Replit OpenID Connect (OIDC)
- Passport.js integration with openid-client
- Automatic user creation/updates on authentication
- Token refresh handling

**Database Layer**: Drizzle ORM with type-safe schema definitions
- Schema-first approach with Zod validation
- Type inference from database schema to TypeScript

## Data Storage

**Database**: PostgreSQL via Neon serverless driver
- WebSocket-based connection pooling for serverless environments
- Connection string from `DATABASE_URL` environment variable

**Schema Design**:

**Sessions Table**: Stores Express session data
- Primary key: `sid` (session ID)
- Includes session payload and expiration timestamp
- Indexed on expiration for cleanup

**Users Table**: Authentication and profile data
- UUID primary key
- Email (unique), first name, last name, profile image URL
- Created/updated timestamps

**Modules Table**: Educational content structure
- String ID (e.g., "devices-basics")
- Title, description, and full markdown content
- Icon name and order index for UI rendering
- Four modules: devices/basics, software, files, browsers

**Questions Table**: Quiz questions per module
- UUID primary key
- Foreign key to module
- Question text, four answer options (JSONB array)
- Correct answer index and order

**Quiz Results Table**: Historical quiz submissions
- Tracks score, total questions, pass/fail status
- Foreign keys to user and module
- Timestamp of submission

**User Progress Table**: Learning progress tracking
- Composite unique constraint on user + module
- Boolean flags for module completion and quiz passage
- Timestamps for completion events

## External Dependencies

**UI Framework**: Radix UI component primitives
- Provides 25+ accessible, unstyled component primitives
- Includes accordion, dialog, dropdown, popover, select, tabs, toast, tooltip, etc.

**Styling**: Tailwind CSS
- Utility-first CSS framework
- Custom configuration with design tokens
- PostCSS for processing

**Authentication**: Replit Auth via OpenID Connect
- Uses `openid-client` and `passport` libraries
- Handles OAuth flow and token management

**Database**: 
- Neon serverless PostgreSQL client
- Drizzle ORM for type-safe queries
- `connect-pg-simple` for session storage

**Form Handling**: React Hook Form with Zod resolvers
- Type-safe form validation
- Integration with Shadcn form components

**Build Tools**:
- Vite for frontend bundling and dev server
- esbuild for backend bundling
- TypeScript for type checking

**Development Tools** (Replit-specific):
- Runtime error overlay plugin
- Cartographer plugin for code mapping
- Development banner

**Utilities**:
- `clsx` and `tailwind-merge` for conditional CSS classes
- `date-fns` for date manipulation
- `nanoid` for unique ID generation
- `memoizee` for function memoization