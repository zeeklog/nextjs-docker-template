import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/database'; // Import getDb

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db;
  try {
    // Get the initialized SQLite database instance synchronously.
    // We keep `await` here for consistency in async handler, though getDb itself is now sync.
    db = getDb();

    if (req.method === 'GET') {
      // Handle GET requests to fetch examples
      // .all() for multiple rows, .get() for single row
      const examples = db.prepare('SELECT id, name, createdAt FROM Example').all();
      return res.status(200).json(examples);
    } else if (req.method === 'POST') {
      // Handle POST requests to create a new example
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Execute an INSERT query. .run() returns a result object including lastInsertRowid.
      const stmt = db.prepare('INSERT INTO Example (name) VALUES (?)');
      const info = stmt.run(name); // info.lastInsertRowid will contain the ID

      // Construct the new example object including the auto-generated ID
      const newExample = { id: info.lastInsertRowid, name, createdAt: new Date().toISOString() };
      return res.status(201).json(newExample);
    } else {
      // Method Not Allowed for other HTTP methods
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) { // Type 'any' used for broader error handling
    console.error('Database operation failed:', error.message || error);
    return res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
  }
}
