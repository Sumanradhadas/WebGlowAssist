import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../lib/storage';
import { insertLeadSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const storage = getStorage();

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id && typeof id === 'string') {
        const lead = await storage.getLead(id);
        if (!lead) {
          return res.status(404).json({ error: 'Lead not found' });
        }
        return res.json(lead);
      }
      
      const leads = await storage.getLeads();
      return res.json(leads);
    }

    if (req.method === 'POST') {
      const result = insertLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Invalid lead data',
          details: result.error.issues,
        });
      }

      const lead = await storage.createLead(result.data);
      return res.status(201).json(lead);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling leads:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
