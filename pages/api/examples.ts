import type { NextApiRequest, NextApiResponse } from 'next';
import { getExamples, insertExample } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Handle GET requests to fetch examples
      const examples = await getExamples();
      return res.status(200).json(examples);
    } else if (req.method === 'POST') {
      // Handle POST requests to create a new example
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const newExample = await insertExample({ name });

      return res.status(201).json(newExample);
    } else {
      // Method Not Allowed for other HTTP methods
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Database operation failed:', error.message || error);
    return res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
  }
}
