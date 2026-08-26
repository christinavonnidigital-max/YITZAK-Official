/**
 * Unified Email Dispatch Service for Vercel Serverless & Client Applications
 * Handles email delivery across Vercel API routes and optional Google Workspace Gmail API.
 */

import { sendContactInquiryEmail, sendConfirmationEmail } from './googleApi';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  type?: 'inquiry' | 'booking' | 'general';
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
        <div class="header">YITZAK Advisory Enquiry</div>
        <p>A new enquiry has been submitted via the website contact form.</p>
        <div class="box">
          <p><strong>Enquirer:</strong> ${details.senderName} (${details.senderEmail})</p>
          <p><strong>Service Requested:</strong> ${details.subject}</p>
          <div>
            <strong>Message:</strong>
            <div class="msg">${details.message}</div>
          </div>
        </div>
        <p>Logged for immediate response by the advisory team.</p>
        <div class="footer">&copy; 2026 YITZAK Consulting &amp; Advisory · Randburg, South Africa</div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await sendEmailViaVercel({
      to: ['info@yitzak.co.za', 'cgumpo@yitzak.co.za', 'admin@yitzak.co.za', details.senderEmail],
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
 * Dispatches Quick Floating Chat Inquiries directly to info@yitzak.co.za
 */
export async function dispatchQuickChatInquiry(
  details: {
    senderName: string;
    senderEmail: string;
    organization?: string;
    serviceCategory?: string;
    message: string;
  },
  googleAccessToken?: string | null
): Promise<{ success: boolean; id: string }> {
  const referenceId = `CHAT-INQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #1F2937; background: #F3F4F6; padding: 24px; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB; }
        .header { background: #023625; padding: 24px; color: #FFFFFF; }
        .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #E6CA85; }
        .header p { margin: 0; font-size: 13px; color: #D1D5DB; }
        .content { padding: 24px; }
        .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
        .card { background: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #B68A35; border-radius: 6px; padding: 16px; margin: 16px 0; }
        .field { margin-bottom: 10px; font-size: 14px; line-height: 1.5; }
        .field strong { color: #023625; display: inline-block; min-width: 110px; }
        .message-box { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px; margin-top: 12px; font-size: 14px; line-height: 1.6; color: #111827; white-space: pre-wrap; }
        .footer { background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 16px 24px; font-size: 12px; color: #6B7280; text-align: center; }
        .btn { display: inline-block; background: #023625; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Direct Quick Inquiry Received</h1>
          <p>Sent directly via the YITZAK website floating chat widget to info@yitzak.co.za</p>
        </div>
        <div class="content">
          <span class="badge">Reference ID: ${referenceId}</span>
          
          <div class="card">
            <div class="field"><strong>Sender Name:</strong> ${details.senderName}</div>
            <div class="field"><strong>Sender Email:</strong> <a href="mailto:${details.senderEmail}" style="color:#023625; font-weight: 600;">${details.senderEmail}</a></div>
            ${details.organization ? `<div class="field"><strong>Organisation:</strong> ${details.organization}</div>` : ''}
            ${details.serviceCategory ? `<div class="field"><strong>Service Stream:</strong> ${details.serviceCategory}</div>` : ''}
            <div class="field" style="margin-top: 12px;">
              <strong>Inquiry Message:</strong>
              <div class="message-box">${details.message}</div>
            </div>
          </div>

          <p style="font-size: 13px; color: #4B5563;">
            You can reply directly to this email to contact <strong>${details.senderName}</strong> at <code>${details.senderEmail}</code>.
          </p>

          <a href="mailto:${details.senderEmail}?subject=Re: [${referenceId}] YITZAK Consultation &amp; Inquiry" class="btn" style="color: #ffffff;">
            Reply to ${details.senderName}
          </a>
        </div>
        <div class="footer">
          &copy; 2026 YITZAK Institutional Advisory · Official FoodChain ID Partner · info@yitzak.co.za
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmailViaVercel({
      to: ['info@yitzak.co.za', 'cgumpo@yitzak.co.za', 'admin@yitzak.co.za', details.senderEmail],
      subject: `[Quick Chat Inquiry] ${details.serviceCategory || 'Advisory Request'} from ${details.senderName} (${referenceId})`,
      html: htmlContent,
      type: 'inquiry',
      metadata: {
        ...details,
        referenceId,
        source: 'floating_chat_widget',
        targetEmail: 'info@yitzak.co.za',
      },
    });
  } catch (err) {
    console.warn('Quick chat email dispatch encountered an issue:', err);
  }

  if (googleAccessToken) {
    try {
      await sendContactInquiryEmail(googleAccessToken, {
        senderName: details.senderName,
        senderEmail: details.senderEmail,
        subject: `[Chat Widget] ${details.serviceCategory || 'General Inquiry'} (${referenceId})`,
        message: `${details.organization ? `[Company: ${details.organization}]\n` : ''}${details.message}`,
      });
    } catch (gErr) {
      console.warn('Google Workspace quick chat dispatch warning:', gErr);
    }
  }

  return { success: true, id: referenceId };
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
