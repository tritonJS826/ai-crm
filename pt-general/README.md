# PT-General Server

This is a Node.js Express server for the PhotoTours application.

## Getting Started

1.  Install dependencies:
    ```bash
    pnpm install
    ```

2.  Create a `.env` file in the root of this directory and add the following environment variable:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
    Replace the values with your database connection details.

3.  Run the database migrations:
    ```bash
    pnpm prisma:migrate
    ```
    This will create the necessary tables in your database. The `prisma:migrate` script runs `prisma migrate dev`. This command should be used during development to create and apply migrations.

4.  Generate the Prisma client:
    ```bash
    pnpm prisma:generate
    ```
    This will generate the Prisma client based on your schema. The `prisma:generate` script runs `prisma generate`. This command should be run after every change to the `schema.prisma` file.

5.  Start the development server:
    ```bash
    pnpm dev
    ```
    The server will start on the port specified in your `.env` file, or on port 3000 by default.

## Scripts

*   `pnpm dev`: Starts the server in development mode with hot reloading.
*   `pnpm build`: Compiles the TypeScript code to JavaScript.
*   `pnpm start`: Starts the server in production mode.
*   `pnpm prisma:migrate`: Runs database migrations.
*   `pnpm prisma:generate`: Generates the Prisma client.
