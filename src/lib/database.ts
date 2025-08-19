import Database from 'better-sqlite3'; // Import the default export from better-sqlite3
import path from 'path';
import fs from 'fs'; // Use fs (synchronous) or fs/promises (async) based on your need

// This variable will hold our singleton database instance
let dbInstance: Database | null = null;

// Define the path for the SQLite database file
const DB_FILE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/dev.db';
const DB_FULL_PATH = path.resolve(process.cwd(), DB_FILE_PATH);

/**
 * Initializes and returns a singleton SQLite database connection.
 * If the database file doesn't exist, it will be created.
 * Also ensures that the necessary tables are created if they don't exist.
 * This function returns synchronously, but its setup is idempotent.
 * @returns {Database} The database instance.
 */
export function getDb(): Database { // Changed to synchronous return
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Ensure the directory for the database file exists synchronously for startup
    const dir = path.dirname(DB_FULL_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Open the database connection. `better-sqlite3` handles file creation.
    // The `readonly: false` and `fileMustExist: false` are default for new DBs
    dbInstance = new Database(DB_FULL_PATH);

    // --- Schema Initialization ---
    // Create the 'Example' table if it doesn't already exist.
    // This ensures the table is available on first run or if dev.db is new.
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS Example (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
    `);

    console.log(`Successfully connected to SQLite database at: ${DB_FULL_PATH}`);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize SQLite database with better-sqlite3:', error);
    throw error;
  }
}

// Ensure the database connection is closed when the Node.js process exits.
// This is critical for better-sqlite3 to flush all changes to disk.
process.on('exit', () => {
  if (dbInstance && !dbInstance.close().open) {
    console.log('Successfully closed SQLite database connection on process exit.');
  }
});

// Handle Ctrl+C and other termination signals for graceful shutdown
process.on('SIGINT', () => {
  if (dbInstance && dbInstance.open) { // Check if it's still open before attempting to close
    console.log('Closing SQLite database connection due to SIGINT.');
    dbInstance.close();
  }
  process.exit();
});
process.on('SIGTERM', () => {
  if (dbInstance && dbInstance.open) {
    console.log('Closing SQLite database connection due to SIGTERM.');
    dbInstance.close();
  }
  process.exit();
});
