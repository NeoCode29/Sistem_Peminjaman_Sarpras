# Sarpras Management System

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14.0 or higher)
- npm (Node Package Manager)
- PostgreSQL database

## Getting Started

Follow these steps to set up and run the project:

### 1. Installation

Install all project dependencies by running:

```bash
npm install
```

### 2. Environment Setup

Create your environment configuration file:

```bash
cp .env.example .env
```

Open the `.env` file and configure the following variables:
- `DATABASE_URL`: Your PostgreSQL database connection string
- [Add other important environment variables here]

### 3. Database Setup

Run database migrations to create the required tables:

```bash
npx prisma migrate dev
```

### 4. Seed Initial Data

Populate the database with initial seed data:

```bash
npm run seed
```

### 5. Start Development Server

Launch the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run seed` - Run database seeder

## Project Structure

```
sarpras/
├── prisma/          # Database schema and migrations
├── public/          # Static files
├── src/             # Source code
│   ├── app/        # Next.js app directory
│   ├── components/ # React components
│   └── lib/        # Utility functions
└── ...
```

## Contributing

[Add contribution guidelines here]

## License

[Add license information here]