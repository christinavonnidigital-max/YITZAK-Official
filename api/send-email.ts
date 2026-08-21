import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, text, type, metadata } = req.body || {};

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        error: 'Missing required parameters: to, subject, and html/text content are required.' 
      });
    }

    const recipientList = Array.isArray(to) ? to : [to];

    // 1. Primary: Resend API Integration (Recommended for Vercel)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'YITZAK Institutional <onboarding@resend.dev>';
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipientList,
            subject: subject,
            html: html || `<p>${text}</p>`,
            text: text,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok) {
          return res.status(200).json({ 
            success: true, 
            provider: 'resend', 
            id: resendData.id,
            message: 'Email delivered successfully via Resend API.' 
          });
        } else {
          console.warn('Resend API returned error status:', resendData);
        }
      } catch (err: any) {
        console.error('Resend execution error:', err);
      }
    }

    // 2. Secondary: SendGrid API Integration
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (sendgridApiKey) {
      try {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'info@yitzak.co.za';
        const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: recipientList.map((e: string) => ({ email: e })) }],
            from: { email: fromEmail, name: 'YITZAK Institutional Advisory' },
            subject: subject,
            content: [{ type: 'text/html', value: html || `<p>${text}</p>` }],
          }),
        });

        if (sgRes.ok || sgRes.status === 202) {
          return res.status(200).json({ 
            success: true, 
            provider: 'sendgrid',
            message: 'Email delivered successfully via SendGrid API.' 
          });
        }
      } catch (err: any) {
        console.error('SendGrid execution error:', err);
      }
    }

    // 3. Tertiary: Generic Webhook Notification (e.g. Zapier / Make / Slack / Custom Webhook)
    const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientList,
            subject,
            html,
            text,
            type,
            metadata,
            timestamp: new Date().toISOString()
          })
        });

        if (webhookRes.ok) {
          return res.status(200).json({ 
            success: true, 
            provider: 'webhook',
            message: 'Email payload forwarded to custom Vercel webhook.' 
          });
        }
      } catch (err: any) {
        console.error('Webhook execution error:', err);
      }
    }

    // 4. Fallback for Vercel Preview / Development environments without API keys
    console.log('[Vercel Serverless Function] Email Received & Logged:', {
      to: recipientList,
      subject,
      type: type || 'general',
      timestamp: new Date().toISOString(),
      metadata
    });

    return res.status(200).json({
      success: true,
      provider: 'simulated',
      message: 'Email received and processed by Vercel serverless function.',
      note: 'To send real emails on Vercel, set RESEND_API_KEY or SENDGRID_API_KEY in Vercel environment variables.'
    });

  } catch (error: any) {
    console.error('Vercel serverless email handler failed:', error);
    return res.status(500).json({ 
      error: 'Internal server error processing email.', 
      details: error?.message 
    });
  }
}
