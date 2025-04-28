# RESTful Express App

This is a simple RESTful API built using Express.

## Table of Contents

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Go to 'backend' directory](#go-to-backend-directory)
  - [Install dependencies](#install-dependencies)
  - [Set up the Database (SQLite)](#set-up-the-database-sqlite)
    - [Migrate Prisma ORM](#migrate-prisma-orm)
    - [Generate Prisma Client](#generate-prisma-client)
    - [Seed the Database (Optional)](#seed-the-database-optional)
    - [See the Database with Prisma Studio (Optional)](#see-the-database-with-prisma-studio-optional)
  - [Start the Server](#start-the-server)
  - [API Endpoints](#api-endpoints)
  - [Unit tests](#unit-tests)
  

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.10.0 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- Git (to clone the repository)

Ensure you have these installed before proceeding.

> if you haven't cloned the repository yet, follow the instructions from the main [README.md](../README.md#clone-the-repository).


### Go to 'backend' directory

This is the backend directory, where the Express app is located.

```bash
cd backend
```

### Install dependencies

> It may take a few minutes to install all the dependencies.

```bash
npm install
```

### Set up the Database (SQLite)

In this project, SQLite is used as the database. It is a file-based database, so you don't need to set up a separate database server. Prisma ORM is used to manage the database schema and migrations.

#### Migrate Prisma ORM

1. Run the following command to create the initial migration and generate the SQLite database file:

```bash
npx prisma migrate dev --name init
```

Output should look like this:

```bash
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

Applying migration `20250426110847_init`

The following migration(s) have been applied:

migrations/
  └─ 20250426110847_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 43ms
```

#### Generate Prisma Client

```bash
npx prisma generate
```

Output should look like this:

```bash
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 40ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize
```


#### Seed the Database (automatically)

When application starts, it will check if the database is empty. If it is empty, it will automatically seed the database with some initial data.

Refer to the [`package.json`](package.json#l8) file for the script that seeds the database.


##### See the Database with Prisma Studio (Optional)

You can use Prisma Studio to view and manage the database. Run the following command to start Prisma Studio:

```bash
npx prisma studio
```

#### Start the Server

```bash
npm run dev
```

Output should look like this:

```bash

> backend@1.0.0 start
> ts-node server.ts

Creating new PrismaClient
Start seeding ...
Creating user with email: esh@example.com
Created user with id: 514e79a5-5a14-4cad-97a2-1e6f655593f6
Creating user with email: esh1@example.com
Created user with id: 9e127bd6-d8b1-4975-a231-1f13aa26b5e1
Creating user with email: esh3@example.com
Created user with id: 3fb27bd2-aa71-4dbf-b9a7-83e5f8739e48
Seeding finished.
Database connected
REST API server ready at: http://localhost:3000
```

Express app should now be running and connected to the SQLite database.

## API Endpoints

| HTTP Method | Endpoint        | Description                                                           | Request Body                                                                 | Response Body                                                    | Authentication Required |
| ----------- | --------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| POST        | `/register`     | Registers a new user                                                  | `{ name: string, email: string, password: string, confirmPassword: string }` | `{ accessToken: string, refreshToken: string }`                  | No                      |
| POST        | `/login`        | Logs in a user                                                        | `{ email: string, password: string }`                                        | `{ message: string, accessToken: string, refreshToken: string }` | No                      |
| POST        | `/logout`       | Logs out a user and revokes all refresh tokens                        | -                                                                            | `{ message: string }`                                            | Yes                     |
| POST        | `/refreshToken` | Refreshes the access token using refresh token                        | `{ refreshToken: string }`                                                   | `{ accessToken: string, refreshToken: string }`                  | No                      |
| GET         | `/`             | Gets user profile details or list of all users based if it admin user | -                                                                            | `{ user: object }` or `{ users: array, user: object }`           | Yes                     |

## Unit tests

Unit tests are written using **Jest** and **Supertest** to ensure the functionality of the backend API.

### Running Tests

To run the tests, use the following command:

```bash
npm run test
```

#### Test Scenarios
The following scenarios are covered in the tests:

**Authentication Routes**:

**POST /auth/register**:
- Successful user registration.
- Registration with missing fields.
- Registration with invalid email.
- Registration with mismatched passwords.
- Registration with an already existing email.

**POST /auth/login**:
- Successful login with valid credentials.
- Login with missing fields.
- Login with invalid credentials.

**POST /auth/logout**:
- Successful user logout.
- Logout without a valid token.

**User Routes**:

GET /users:
- Admin user retrieves all users and their own details.
- Non-admin user retrieves only their own details.
- User not found.
- Invalid request.

GET /users/profile:
- Retrieve authenticated user's profile details.
- User not found.
- Invalid request.