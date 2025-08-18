import { open } from 'node-sqlite-wasm';
import path from 'path';
import fs from 'fs/promises';

// This variable will hold our singleton database instance
let dbInstance: any = null; // Type will be node-sqlite-wasm's Database

// Define the path for the SQLite database file
const DB_FILE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/dev.db';
const DB_FULL_PATH = path.resolve(process.cwd(), DB_FILE_PATH);


/**
 * Initializes and returns a singleton SQLite database connection.
 * If the database file doesn't exist, it will be created.
 * Also ensures that the necessary tables are created if they don't exist.
 * @returns {Promise<any>} The database instance.
 */
export async function getDb(): Promise<any> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Ensure the directory for the database file exists
    await fs.mkdir(path.dirname(DB_FULL_PATH), { recursive: true });

    // Open the database connection. `node-sqlite-wasm` handles WASM loading
    // and file persistence directly based on the provided path.
    dbInstance = await open(DB_FULL_PATH);

    // --- Schema Initialization ---
    // Create the 'Example' table if it doesn't already exist.
    // This ensures the table is available on first run or if dev.db is new.
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS Example (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
    `);

    console.log(`Successfully connected to SQLite database at: ${DB_FULL_PATH}`);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize SQLite database with node-sqlite-wasm:', error);
    throw error;
  }
}

// With `node-sqlite-wasm`, persistence to the file is handled automatically
// when you perform write operations (INSERT, UPDATE, DELETE).
// You do not need a separate `saveDb` function like with `sql.js`'s in-memory model.

// Best effort to close the database when the process exits.
// This is important for clean shutdown and ensuring all writes are flushed.
process.on('exit', () => {
  if (dbInstance) {
    console.log('Closing SQLite database connection on process exit.');
    dbInstance.close();
  }
});

process.on('SIGINT', () => { // Handle Ctrl+C
  if (dbInstance) {
    console.log('Closing SQLite database connection due to SIGINT.');
    dbInstance.close();
  }
  process.exit();
});
