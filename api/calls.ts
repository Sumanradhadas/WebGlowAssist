import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../lib/storage';
import { insertCallLogSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const storage = getStorage();

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id && typeof id === 'string') {
        const callLog = await storage.getCallLog(id);
        if (!callLog) {
          return res.status(404).json({ error: 'Call log not found' });
        }
        return res.json(callLog);
      }
      
      const callLogs = await storage.getCallLogs();
      return res.json(callLogs);
    }

    if (req.method === 'POST') {
      const result = insertCallLogSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Invalid call log data',
          details: result.error.issues,
        });
      }

      const callLog = await storage.createCallLog(result.data);
      return res.status(201).json(callLog);
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Call ID required' });
      }

      const updates = req.body;
      const callLog = await storage.updateCallLog(id, updates);
      if (!callLog) {
        return res.status(404).json({ error: 'Call log not found' });
      }
      return res.json(callLog);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling call logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
