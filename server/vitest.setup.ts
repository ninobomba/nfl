import { initializeDatabase } from './src/utils/initDb.js';

export default async function () {
    console.log('--- GLOBAL SETUP: Initializing Database for tests ---');
    await initializeDatabase();
    console.log('--- GLOBAL SETUP: DONE ---');
}
