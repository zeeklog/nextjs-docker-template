import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/database'; // Import only getDb

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db;
  try {
    db = await getDb(); // Get the initialized SQLite database instance

    if (req.method === 'GET') {
      // Handle GET requests to fetch examples
      const examples = await db.all('SELECT id, name, createdAt FROM Example');
      return res.status(200).json(examples);
    } else if (req.method === 'POST') {
      // Handle POST requests to create a new example
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Execute an INSERT query. `node-sqlite-wasm`'s `run` method
      // returns information including `lastID` directly.
      const result = await db.run('INSERT INTO Example (name) VALUES (?)', name);

      // Construct the new example object including the auto-generated ID
      const newExample = { id: result.lastID, name, createdAt: new Date().toISOString() };
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
  // No explicit db.close() here as getDb returns a singleton and connections
  // are often managed for the lifetime of the serverless function/process.
}
