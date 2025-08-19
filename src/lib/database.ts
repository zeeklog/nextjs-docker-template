import { Low } from 'lowdb';
import { JSONFile } from '@foreast/file-async'; // Correct import for JSONFile
import path from 'path';
import fs from 'fs'; // Used only for checking directory existence synchronously for initial setup

// Define the shape of your database
interface DbSchema {
  examples: { id: number; name: string; createdAt: string }[];
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

    // Configure the adapter for JSON file persistence
    const adapter = new JSONFile<DbSchema>(DB_FULL_PATH);
    dbInstance = new Low<DbSchema>(adapter);

    // Read data from disk. If file doesn't exist, data will be null.
    await dbInstance.read();

    // Set default data if the database file was empty or didn't exist
    if (dbInstance.data === null || Object.keys(dbInstance.data).length === 0) {
      dbInstance.data = { examples: [] }; // Initialize with an empty examples array
      await dbInstance.write(); // Write the default data to disk
      console.log(`Initialized new database at: ${DB_FULL_PATH}`);
    } else {
      console.log(`Loaded existing database from: ${DB_FULL_PATH}`);
    }

    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize Lowdb database:', error);
    throw error;
  }
}

// Note: With Lowdb and JSONFile adapter, after any modification to db.data,
// you must call `db.write()` to persist changes to the file.
// This will be handled in the API routes.
