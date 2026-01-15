#!/bin/bash
# Install dependencies
cd server
npm install passport-google-oauth20
npm install -D @types/passport-google-oauth20

# Run Prisma migration
npx prisma migrate dev --name add_google_id

echo "Setup complete. Please remember to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file."
