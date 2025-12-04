import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, callStartTime, callEndTime, duration, browserInfo } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    const startDate = new Date(callStartTime);
    const endDate = new Date(callEndTime);
    const durationSeconds = parseInt(duration, 10) || 0;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2dd4bf;">New Voice Service Usage</h2>
        <p>A visitor used the voice service on the WebGlow Support website.</p>
        
        <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2dd4bf; margin-top: 0;">Call Details</h3>
          <table style="width: 100%; color: #e2e8f0;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;"><strong>Start Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;">${startDate.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;"><strong>End Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;">${endDate.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;"><strong>Duration:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;">${formatDuration(durationSeconds)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Browser/Device:</strong></td>
              <td style="padding: 8px 0;">${browserInfo || 'Unknown'}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2dd4bf; margin-top: 0;">Transcript</h3>
          <pre style="color: #e2e8f0; white-space: pre-wrap; word-wrap: break-word; font-family: monospace; font-size: 14px; line-height: 1.6; margin: 0;">${escapeHtml(transcript)}</pre>
        </div>
        
        <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;">
        <p style="color: #64748b; font-size: 12px;">This is an automated notification from WebGlow Support.</p>
      </div>
    `;

    await resend.emails.send({
      from: 'WebGlow Support <onboarding@resend.dev>',
      to: ['glowseoulaura@yahoo.com'],
      subject: `New Voice Service Usage - ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}`,
      html: emailHtml,
    });

    console.log('Transcript notification email sent successfully');
    return res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
