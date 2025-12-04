import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const storage = getStorage();

  try {
    const stats = await storage.getCallStats();
    const leads = await storage.getLeads();

    return res.json({
      ...stats,
      totalLeads: leads.length,
      leadCaptureRate:
        stats.totalCalls > 0
          ? Math.round((leads.length / stats.totalCalls) * 100)
          : 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
