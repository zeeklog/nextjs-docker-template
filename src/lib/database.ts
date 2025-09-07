import Datastore from 'nedb';
import path from 'path';
import fs from 'fs';

// Define the generic shape of your database for the template.
interface DbSchema {
  examples: { id: number; name: string; createdAt: string }[];
  // Future: The AI will add new collections here based on user needs
}

// Define the path for the database file
const DB_FILE_NAME = 'examples.nedb';
const DB_DIR_PATH = process.env.DATABASE_DIR || './data';
const DB_FULL_PATH = path.resolve(process.cwd(), DB_DIR_PATH, DB_FILE_NAME);

// Ensure the database directory exists
if (!fs.existsSync(DB_DIR_PATH)) {
  fs.mkdirSync(DB_DIR_PATH, { recursive: true });
}

// Initialize the database
const db = new Datastore({ filename: DB_FULL_PATH, autoload: true });

// Create indexes
db.ensureIndex({ fieldName: 'id', unique: true });

/**
 * Gets all examples from the database
 */
export const getExamples = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.find({}, (err: Error | null, docs: any[]) => {
      if (err) reject(err);
      resolve(docs);
    });
  });
};

/**
 * Inserts a new example into the database
 */
export const insertExample = (example: { name: string }): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.find({}).sort({ id: -1 }).limit(1).exec((err: Error | null, docs: any[]) => {
      if (err) reject(err);
      
      const newId = docs.length > 0 ? docs[0].id + 1 : 1;
      const newExample = {
        id: newId,
        name: example.name,
        createdAt: new Date().toISOString()
      };

      db.insert(newExample, (err: Error | null, doc: any) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  });
};

// Export the db instance for direct access if needed
export const getDb = () => db;
