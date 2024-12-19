# Scheduling Calendar Application

This is a comprehensive scheduling system with multi-user support, dynamic calendar views, and booking functionality.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your environment variables
4. Set up the database: `npx prisma migrate dev`
5. Run the development server: `npm run dev`

## Testing

- Run unit tests: `npm test`
- Run end-to-end tests: `npm run cypress:run`
- Run load tests: `k6 run load-tests/booking-test.js`

## Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`

## Environment Variables

Ensure all variables in `.env.example` are set in your production environment.

## Features

- Multi-user support (Admin, Staff, Service User, Contractor)
- Dynamic weekly/monthly calendar views
- Shift booking with notifications
- Admin panel for user management
- Data persistence across sessions

## Tech Stack

- Next.js
- React
- Prisma
- PostgreSQL
- Tailwind CSS

## Security

- Input validation and sanitization using Zod
- Rate limiting on API routes
- CSRF protection

## Performance

- Server-side rendering for initial load
- Caching for frequently accessed data
- Load tested with k6

## Monitoring

- Error tracking with Sentry
- Logging with Winston

Before deploying to production, ensure all tests pass and perform a thorough security audit.

