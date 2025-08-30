# Backend

Express.js backend API for Evalis-GT educational platform.

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm start
```

## Environment Variables

Required environment variables:
```env
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
PORT=5000
NODE_ENV=production
```

## Database Setup

```bash
# Run database migrations
npm run migrate

# Seed data
npm run data:import
```

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/students` - Student management
- `/api/teachers` - Teacher management  
- `/api/subjects` - Subject management
- `/api/assignments` - Assignment handling
- `/api/certificates` - Certificate generation

## Tech Stack

- Express.js
- PostgreSQL
- Clerk Authentication
- JWT tokens
- File uploads with Multer
