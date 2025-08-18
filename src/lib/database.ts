import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// This variable will hold our singleton database instance
let dbInstance: Database | null = null;

/**
 * Initializes and returns a singleton SQLite database connection.
 * If the database file doesn't exist, it will be created.
 * It also ensures that the necessary tables are created if they don't exist.
 * @returns {Promise<sqlite.Database>} The database instance.
 */
export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  // Determine the path for the SQLite database file
  // It's expected to be relative to the project root, typically mounted via Docker volume.
  // The DATABASE_URL environment variable might look like "file:./data/dev.db"
  const dbFilePath = process.env.DATABASE_URL?.replace('file:', '') || './data/dev.db';
  
  // Resolve the full path to ensure it's correct within the execution environment
  // For Docker, this will effectively resolve relative to /app
  const dbFullPath = path.resolve(process.cwd(), dbFilePath);

  try {
    // Open the database connection
    dbInstance = await open({
      filename: dbFullPath,
      driver: sqlite3.Database, // Use the sqlite3 driver
    });

    // --- Schema Initialization ---
    // This part creates the 'Example' table if it doesn't already exist.
    // This eliminates the need for the user to run `npm run prisma:migrate` initially.
    // For more complex schemas, you might add more CREATE TABLE statements or
    // implement a more sophisticated, in-app migration system.
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS Example (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(`Successfully connected to SQLite database at: ${dbFullPath}`);
    return dbInstance;
  } catch (error) {
    console.error('Failed to open SQLite database:', error);
    // It's crucial to re-throw the error so the application doesn't proceed
    // without a database connection.
    throw error;
  }
}
