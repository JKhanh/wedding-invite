# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korora is a full-stack wedding website built with Next.js (Pages Router), TypeScript, Prisma, and PostgreSQL. It provides guest management, RSVP tracking, gift registry, and interactive features for wedding information.

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Prisma commands
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations in development
npx prisma studio      # Open Prisma Studio GUI
```

## Architecture Overview

### Authentication Flow
- Uses NextAuth.js with custom credentials provider in `/src/pages/api/auth/[...nextauth].ts`
- Authentication requires firstName, lastName, and a global password (stored in `PASSWORD` env var)
- Sessions use JWT with 15-day expiry
- User roles determined by invitation categories (bridalParty, dinner flags)

### Database Architecture
- PostgreSQL database accessed via Prisma ORM
- Two main models: User (guests) and Gift (registry items)
- Prisma client singleton pattern in `/src/prisma.ts` prevents connection exhaustion
- Composite unique constraint on User firstName + lastName

### API Design
- API routes in `/src/pages/api/` handle:
  - Authentication (`/api/auth/*`)
  - RSVP updates (`/api/updateRSVP.ts`)
  - Gift reservation (`/api/reserveGift.ts`)
- All API routes use Zod for request validation
- Authentication required via NextAuth session checks

### Frontend Architecture
- Main pages: index (home/login) and dashboard (authenticated area)
- Framer Motion animations configured in `/src/utils/motionText.ts`
- Image carousel data in `/src/utils/slides.ts`
- Global styles use Tailwind with custom Ogg and Styrene fonts
- Responsive design with custom breakpoints

## Environment Setup

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `PASSWORD`: Global authentication password
- `NEXTAUTH_SECRET`: Session encryption secret
- `NEXTAUTH_URL`: Application URL (e.g., http://localhost:3000)

For local development with Docker:
```bash
docker-compose up -d  # Starts PostgreSQL container
```

## Key Dependencies

- **Next.js 13.5.8**: React framework (using Pages Router)
- **Prisma 4.16.2**: Database ORM
- **NextAuth.js 4.24.11**: Authentication
- **TailwindCSS + DaisyUI**: Styling
- **Framer Motion**: Animations
- **React Hook Form + Zod**: Form handling and validation
- **Mapbox GL**: Interactive maps