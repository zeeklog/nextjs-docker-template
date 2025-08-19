import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node'; // Corrected import path for JSONFile
import path from 'path';
import fs from 'fs'; // Used only for checking directory existence synchronously for initial setup

// Define the shape of your database
interface DbSchema {
  examples: { id: number; name: string; createdAt: string }[];
  // Removed 'pollinationModels' as it's specific to a sample app, not the generic template.
}

// Define the path for the JSON database file
// It's expected to be relative to the project root, typically mounted via Docker volume.
// We'll use a fixed name like 'db.json'
const DB_FILE_NAME = 'db.json';
const DB_DIR_PATH = process.env.DATABASE_DIR || './data'; // Allows configuring DB directory via env
const DB_FULL_PATH = path.resolve(process.cwd(), DB_DIR_PATH, DB_FILE_NAME);

let dbInstance: Low<DbSchema> | null = null;

/**
 * Initializes and returns a singleton Lowdb database instance.
 * If the database file doesn't exist, it will be created with default data.
 * @returns {Promise<Low<DbSchema>>} The database instance.
 */
export async function getDb(): Promise<Low<DbSchema>> {
  if (dbInstance) {
    // If the database is already initialized and read, return it.
    if (dbInstance.data) {
      return dbInstance;
    }
    // If dbInstance exists but data hasn't been read yet, wait for it.
    await dbInstance.read();
    return dbInstance;
  }

  try {
    // Ensure the directory for the database file exists
    const dir = path.dirname(DB_FULL_PATH);
    if (!fs.existsSync(dir)) { // Use sync version for initial dir creation
      fs.mkdirSync(dir, { recursive: true });
    }

    // Configure the adapter for JSON file persistence using lowdb's JSONFile
    const adapter = new JSONFile<DbSchema>(DB_FULL_PATH);
    // CRITICAL FIX: Pass default data directly to the Low constructor, with only generic 'examples'
    dbInstance = new Low<DbSchema>(adapter, { examples: [] }); // Provide initial structure

    // Read data from disk. If file doesn't exist or is empty, it will use the default data.
    await dbInstance.read();

    console.log(`Database initialized/loaded from: ${DB_FULL_PATH}`);

    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize Lowdb database:', error);
    throw error;
  }
}

// Note: With Lowdb and JSONFile adapter, after any modification to db.data,
// you must call `db.write()` to persist changes to the file.
// This will be handled in the API routes.
