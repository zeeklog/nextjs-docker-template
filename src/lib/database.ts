import Datastore from '@seald-io/nedb';
import path from 'path';
import fs from 'fs';

// Define types for our database documents
interface Example {
  _id?: string;      // NeDB auto-generates this field
  id: number;        // Our custom sequential ID
  name: string;
  createdAt: string;
}

// Type for creating a new example (without _id)
type NewExample = Omit<Example, '_id'>;

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
export const getExamples = (): Promise<Example[]> => {
  return new Promise((resolve, reject) => {
    db.find<Example>({}, (err: Error | null, docs: Example[]) => {
      if (err) reject(err);
      resolve(docs);
    });
  });
};

/**
 * Inserts a new example into the database
 */
export const insertExample = (example: { name: string }): Promise<Example> => {
  return new Promise((resolve, reject) => {
    db.find<Example>({}).sort({ id: -1 }).limit(1).exec((err: Error | null, docs: Example[]) => {
      if (err) reject(err);
      
      const newId = docs.length > 0 ? docs[0].id + 1 : 1;
      const newExample: NewExample = {
        id: newId,
        name: example.name,
        createdAt: new Date().toISOString()
      };

      db.insert(newExample, (err: Error | null, doc: Example) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  });
};

// Export the db instance for direct access if needed
export const getDb = () => db;
