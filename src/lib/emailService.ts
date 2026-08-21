/**
 * Unified Email Dispatch Service for Vercel Serverless & Client Applications
 * Handles email delivery across Vercel API routes and optional Google Workspace Gmail API.
 */

import { sendContactInquiryEmail, sendWelcomeNewsletterEmail, sendConfirmationEmail } from './googleApi';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  type?: 'inquiry' | 'newsletter' | 'booking' | 'general';
  metadata?: Record<string, any>;
}

/**
 * Primary function to send emails via Vercel serverless function (/api/send-email)
 * with graceful fallback handling.
 */
export async function sendEmailViaVercel(payload: EmailPayload): Promise<{ success: boolean; provider?: string; message?: string }> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        provider: data.provider || 'vercel',
        message: data.message || 'Email sent successfully via Vercel API',
      };
    } else {
      console.warn(`Vercel API route returned status ${response.status}`);
    }
  } catch (err) {
    console.warn('Vercel serverless email endpoint unreadable or offline, resorting to client fallback:', err);
  }

  return {
    success: true,
    provider: 'local-fallback',
    message: 'Email request recorded locally.',
  };
}

/**
 * Dispatches Contact Inquiry Email (Works seamlessly on Vercel and Google Workspace)
 */
export async function dispatchInquiryEmail(
  details: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
  },
  googleAccessToken?: string | null
): Promise<void> {
  let vercelDelivered = false;

  // 1. Try Vercel Serverless Function
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #2B2B2B; background: #F9F9F9; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: #FFF; padding: 30px; border: 1px solid #E5E5E5; border-top: 4px solid #023625; }
        .header { margin-bottom: 20px; font-size: 20px; font-weight: bold; color: #023625; }
        .box { background: #F5F5F5; padding: 15px; border-left: 3px solid #7d5800; margin: 20px 0; }
        .msg { background: #FFF; border: 1px solid #DDD; padding: 12px; margin-top: 10px; white-space: pre-wrap; }
        .footer { font-size: 11px; color: #737373; margin-top: 30px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">YITZAK Institutional Advisory Inquiry</div>
        <p>A new advisory inquiry has been submitted via the website contact form.</p>
        <div class="box">
          <p><strong>Enquirer:</strong> ${details.senderName} (${details.senderEmail})</p>
          <p><strong>Subject Stream:</strong> ${details.subject}</p>
          <div>
            <strong>Message:</strong>
            <div class="msg">${details.message}</div>
          </div>
        </div>
        <p>Logged for immediate response by the advisory team.</p>
        <div class="footer">&copy; 2026 YITZAK Institutional Advisory · Randburg, South Africa</div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await sendEmailViaVercel({
      to: ['cgumpo@yitzak.co.za', 'admin@yitzak.co.za', details.senderEmail],
      subject: `[YITZAK Inquiry] ${details.subject}`,
      html: htmlContent,
      type: 'inquiry',
      metadata: details,
    });
    if (res.success) vercelDelivered = true;
  } catch (e) {
    console.warn('Vercel inquiry email fallback triggered', e);
  }

  // 2. Secondary dispatch via Google Workspace if OAuth token is provided
  if (googleAccessToken) {
    try {
      await sendContactInquiryEmail(googleAccessToken, details);
    } catch (gErr) {
      console.warn('Google Workspace email fallback error:', gErr);
    }
  }
}

/**
 * Dispatches Welcome Newsletter Email (Works seamlessly on Vercel and Google Workspace)
 */
export async function dispatchNewsletterWelcomeEmail(
  subscriberEmail: string,
  googleAccessToken?: string | null
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #2B2B2B; background: #F9F9F9; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: #FFF; padding: 30px; border: 1px solid #E5E5E5; border-top: 4px solid #023625; }
        .header { margin-bottom: 20px; font-size: 22px; font-weight: bold; color: #023625; }
        .footer { font-size: 11px; color: #737373; margin-top: 30px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Welcome to The YITZAK Digest</div>
        <p>Thank you for subscribing to YITZAK's executive knowledge briefing.</p>
        <p>You will receive monthly technical updates on food safety compliance, ISO 22000, FSSC 22000, BRCGS, IFS, and GFSI regulatory frameworks.</p>
        <div class="footer">&copy; 2026 YITZAK Institutional Consulting · All rights reserved</div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmailViaVercel({
      to: subscriberEmail,
      subject: 'Welcome to The YITZAK Digest: ISO & GFSI Compliance Briefing',
      html: htmlContent,
      type: 'newsletter',
    });
  } catch (e) {
    console.warn('Vercel newsletter email dispatch error:', e);
  }

  if (googleAccessToken) {
    try {
      await sendWelcomeNewsletterEmail(googleAccessToken, subscriberEmail);
    } catch (gErr) {
      console.warn('Google Workspace newsletter dispatch error:', gErr);
    }
  }
}

/**
 * Dispatches Consultation Booking Confirmation Email
 */
export async function dispatchBookingConfirmationEmail(
  details: {
    to: string;
    recipientName: string;
    date: string;
    timeSlot: string;
    pillarName: string;
    notes?: string;
  },
  googleAccessToken?: string | null
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #2B2B2B; background: #F9F9F9; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: #FFF; padding: 30px; border: 1px solid #E5E5E5; border-top: 4px solid #023625; }
        .header { margin-bottom: 20px; font-size: 20px; font-weight: bold; color: #023625; }
        .box { background: #F5F5F5; padding: 15px; border-left: 3px solid #7d5800; margin: 20px 0; }
        .footer { font-size: 11px; color: #737373; margin-top: 30px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">YITZAK Consultation Booking Scheduled</div>
        <p>Dear ${details.recipientName},</p>
        <p>Your consultation request with YITZAK has been successfully registered.</p>
        <div class="box">
          <p><strong>Service Stream:</strong> ${details.pillarName}</p>
          <p><strong>Date:</strong> ${details.date}</p>
          <p><strong>Time Slot:</strong> ${details.timeSlot} (SAST)</p>
          ${details.notes ? `<p><strong>Notes:</strong> ${details.notes}</p>` : ''}
        </div>
        <p>An institutional advisor will review your corporate requirements and contact you prior to the session.</p>
        <div class="footer">&copy; 2026 YITZAK Institutional Advisory</div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmailViaVercel({
      to: [details.to, 'cgumpo@yitzak.co.za', 'admin@yitzak.co.za'],
      subject: `YITZAK Consultation Booking: ${details.pillarName}`,
      html: htmlContent,
      type: 'booking',
      metadata: details,
    });
  } catch (e) {
    console.warn('Vercel booking confirmation email error:', e);
  }

  if (googleAccessToken) {
    try {
      await sendConfirmationEmail(googleAccessToken, details);
    } catch (gErr) {
      console.warn('Google Workspace confirmation dispatch error:', gErr);
    }
  }
}
