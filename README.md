# Files Manager

A simple file management API using Express, MongoDB, Redis, Bull, and Node.js.

## Setup

****What you need:****

- Node.js
- Yarn
- Google API (for email)
- MongoDB
- Redis

****Environment setup:****

Create a `.env` file with these variables:

- **GOOGLE_MAIL_SENDER**: Email for sending user emails (required)
- **PORT**: Server port (default: 5000)
- **DB_HOST**: Database host (default: localhost)
- **DB_PORT**: Database port (default: 27017)
- **DB_DATABASE**: Database name (default: files_manager)
- **FOLDER_PATH**: Where files are saved (default: /tmp/files_manager or %TEMP%/files_manager)

## Getting started

1. Clone the repo
2. Run `yarn install` or `npm install`
3. Start Redis and MongoDB
4. Run `yarn start-server` or `npm run start-server`

## Testing

Create a `.env.test` file for test environment variables

Run `yarn test` or `npm run test`

## To-do

- Generate API docs with apidoc

## Learn more

Check out these resources:

- Node.js basics
- Express.js
- Mocha for testing
- MongoDB
- Redis
- Bull for job processing
- Image thumbnail creation
- MIME types
