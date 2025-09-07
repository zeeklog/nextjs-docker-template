import Datastore from '@seald-io/nedb';
import path from 'path';
import fs from 'fs';

/**
 * Next.js App Router Route Handler Type Guide
 * 
 * When creating dynamic route handlers (e.g., [id]/route.ts), always use the correct parameter typing:
 * 
 * export async function GET(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   // Note: params.id will be a string, so convert if needed:
 *   const id = parseInt(params.id, 10);
 *   // ... rest of your handler
 * }
 */

// Define types for our database documents
export interface Example {
  _id?: string;      // NeDB auto-generates this field
  id: number;        // Our custom sequential ID
  name: string;
  createdAt: string;
}

// Type for creating a new example (without _id)
export type NewExample = Omit<Example, '_id'>;

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

/**
 * Gets a single example by ID
 */
export const getExampleById = (id: number): Promise<Example | null> => {
  return new Promise((resolve, reject) => {
    db.findOne<Example>({ id }, (err: Error | null, doc: Example | null) => {
      if (err) reject(err);
      resolve(doc);
    });
  });
};

/**
 * Updates an example by ID
 */
export const updateExample = (id: number, update: Partial<Example>): Promise<Example | null> => {
  return new Promise((resolve, reject) => {
    db.update<Example>(
      { id },
      { $set: update },
      { returnUpdatedDocs: true },
      (err: Error | null, numAffected: number, doc: Example | null) => {
        if (err) reject(err);
        resolve(doc);
      }
    );
  });
};

/**
 * Deletes an example by ID
 */
export const deleteExample = (id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.remove({ id }, {}, (err: Error | null, n: number) => {
      if (err) reject(err);
      resolve(n);
    });
  });
};

// Export the db instance for direct access if needed
export const getDb = () => db;
