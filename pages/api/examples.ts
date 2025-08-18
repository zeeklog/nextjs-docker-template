import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, saveDb } from '../../lib/database'; // Import both getDb and saveDb

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db;
  try {
    db = await getDb(); // Get the initialized SQL.js database instance

    if (req.method === 'GET') {
      // Handle GET requests to fetch examples
      // Use db.exec() for queries that don't return results or for schema changes
      // Use db.prepare() and .all() or .get() for selecting data
      const stmt = db.prepare('SELECT id, name, createdAt FROM Example');
      const examples = stmt.all(); // Execute the query and get all results
      stmt.free(); // Free the statement to release resources

      return res.status(200).json(examples);
    } else if (req.method === 'POST') {
      // Handle POST requests to create a new example
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Execute an INSERT query
      // Use db.run() for INSERT, UPDATE, DELETE queries
      const stmt = db.prepare('INSERT INTO Example (name) VALUES (?)');
      const result = stmt.run(name); // Execute with parameters
      stmt.free(); // Free the statement

      // SQL.js doesn't give lastID directly from .run() in the same way sqlite3 does.
      // We often retrieve it with a separate query or rely on client-side ID generation
      // for this simple case. For auto-increment, a SELECT LAST_INSERT_ROWID() is common.
      const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
      const newId = lastIdResult.values[0][0]; // Extract the ID

      // After any write operation, make sure to save the in-memory database to disk!
      await saveDb();

      const newExample = { id: newId, name, createdAt: new Date().toISOString() };
      return res.status(201).json(newExample);
    } else {
      // Method Not Allowed for other HTTP methods
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
