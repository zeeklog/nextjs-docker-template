import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/database'; // Import your new database utility

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db; // Declare db outside try block for finally access if needed
  try {
    db = await getDb(); // Get the initialized SQLite database instance

    if (req.method === 'GET') {
      // Handle GET requests to fetch examples
      const examples = await db.all('SELECT * FROM Example'); // Execute a SELECT query
      return res.status(200).json(examples);
    } else if (req.method === 'POST') {
      // Handle POST requests to create a new example
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Execute an INSERT query
      const result = await db.run('INSERT INTO Example (name) VALUES (?)', name);

      // For SQLite, result.lastID will contain the ID of the newly inserted row
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
