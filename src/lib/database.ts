import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs/promises'; // Using promises API for async operations

// This variable will hold our singleton database instance
let dbInstance: initSqlJs.Database | null = null;
let SQL: initSqlJs.SqlJsStatic | null = null; // Store the initialized SQL.js module

// Define the path for the SQLite database file
// It's expected to be relative to the project root, typically mounted via Docker volume.
// The DATABASE_URL environment variable might look like "file:./data/dev.db"
const DB_FILE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/dev.db';
const DB_FULL_PATH = path.resolve(process.cwd(), DB_FILE_PATH);

/**
 * Initializes the SQL.js WASM module and loads/creates the database.
 * If the database file doesn't exist, it will be created.
 * Also ensures that the necessary tables are created if they don't exist.
 * @returns {Promise<initSqlJs.Database>} The database instance.
 */
export async function getDb(): Promise<initSqlJs.Database> {
  if (dbInstance && SQL) {
    return dbInstance;
  }

  try {
    // Initialize SQL.js WASM module (only once)
    // Place sql-wasm.wasm in your `public` directory so Next.js can serve it.
    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: file => `/sql-wasm.wasm`,
      });
    }

    let buffer: Uint8Array | undefined;
    try {
      // Attempt to load existing database file from the file system
      buffer = await fs.readFile(DB_FULL_PATH);
      console.log(`Loaded existing database from: ${DB_FULL_PATH}`);
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        console.log(`Database file not found at: ${DB_FULL_PATH}. Creating new database in memory.`);
      } else {
        console.error('Error reading database file, starting with empty database:', readError);
      }
      // If file doesn't exist or other read error, 'buffer' remains undefined,
      // and a new in-memory database will be created.
    }

    // Create a new database instance from buffer (if loaded) or an empty one
    dbInstance = new SQL.Database(buffer);

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

    console.log(`Successfully connected to SQL.js database.`);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize SQL.js database:', error);
    // It's crucial to re-throw the error so the application doesn't proceed
    // without a database connection.
    throw error;
  }
}

/**
 * Exports the current in-memory database to the file system.
 * This function MUST be called after any write operation (INSERT, UPDATE, DELETE)
 * to persist changes to the `dev.db` file.
 */
export async function saveDb(): Promise<void> {
  if (!dbInstance) {
    console.warn('No database instance to save.');
    return;
  }
  try {
    const data = dbInstance.export(); // Get the entire database as a Uint8Array
    // Ensure the directory exists before writing the file
    await fs.mkdir(path.dirname(DB_FULL_PATH), { recursive: true });
    await fs.writeFile(DB_FULL_PATH, data);
    console.log(`Database saved to: ${DB_FULL_PATH}`);
  } catch (error) {
    console.error('Failed to save SQL.js database:', error);
    throw error;
  }
}

// Best effort to close the database when the process exits.
// Note: In serverless or ephemeral environments, this might not always reliably trigger.
// Explicitly calling `saveDb` after writes is the main persistence mechanism.
process.on('exit', () => {
  if (dbInstance) {
    console.log('Closing SQL.js database connection on process exit.');
    dbInstance.close();
  }
});

process.on('SIGINT', () => {
  if (dbInstance) {
    console.log('Closing SQL.js database connection due to SIGINT.');
    dbInstance.close();
  }
  process.exit();
});
