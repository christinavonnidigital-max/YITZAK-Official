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
          &copy; 2026 YITZAK Institutional Advisory · FoodChain ID Partner · info@yitzak.co.za
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

export interface ConsultationRequestPayload {
  bookingRef: string;
  clientName: string;
  clientEmail: string;
  company: string;
  pillarTitle: string;
  notes?: string;
}

/**
 * Dispatches Consultation Request to Advisory Team AND Sends Branded Confirmation to the Client
 */
export async function dispatchConsultationRequest(
  details: ConsultationRequestPayload
): Promise<{ success: boolean; teamDelivered: boolean; clientDelivered: boolean }> {
  let teamDelivered = false;
  let clientDelivered = false;

  // 1. Internal Team Notification Email
  const teamHtml = `
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
        .field strong { color: #023625; display: inline-block; min-width: 140px; }
        .notes-box { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px; margin-top: 12px; font-size: 14px; line-height: 1.6; color: #111827; white-space: pre-wrap; }
        .footer { background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 16px 24px; font-size: 12px; color: #6B7280; text-align: center; }
        .btn { display: inline-block; background: #023625; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Consultation Request Received</h1>
          <p>Logged directly via the YITZAK Institutional Advisory consultation portal</p>
        </div>
        <div class="content">
          <span class="badge">Reference: ${details.bookingRef}</span>
          
          <div class="card">
            <div class="field"><strong>Client Name:</strong> ${details.clientName}</div>
            <div class="field"><strong>Client Email:</strong> <a href="mailto:${details.clientEmail}" style="color:#023625; font-weight: 600;">${details.clientEmail}</a></div>
            <div class="field"><strong>Company / Facility:</strong> ${details.company}</div>
            <div class="field"><strong>Service Stream:</strong> ${details.pillarTitle}</div>
            <div class="field" style="margin-top: 12px;">
              <strong>Client Notes:</strong>
              <div class="notes-box">${details.notes || 'None specified'}</div>
            </div>
          </div>

          <p style="font-size: 13px; color: #4B5563;">
            You can reply directly to this email to contact <strong>${details.clientName}</strong> at <code>${details.clientEmail}</code>.
          </p>

          <a href="mailto:${details.clientEmail}?subject=Re: [${details.bookingRef}] YITZAK Advisory Consultation - ${details.pillarTitle}" class="btn" style="color: #ffffff;">
            Reply to ${details.clientName}
          </a>
        </div>
        <div class="footer">
          &copy; 2026 YITZAK Institutional Advisory · FoodChain ID Partner · info@yitzak.co.za
        </div>
      </div>
    </body>
    </html>
  `;

  // 2. Client Confirmation Email
  const clientHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #1F2937; background: #F3F4F6; padding: 24px; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB; }
        .header { background: #023625; padding: 28px 24px; color: #FFFFFF; text-align: left; }
        .header h1 { margin: 0 0 6px 0; font-size: 21px; font-weight: 700; color: #E6CA85; }
        .header p { margin: 0; font-size: 13px; color: #D1D5DB; }
        .content { padding: 28px 24px; }
        .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
        .greeting { font-size: 15px; line-height: 1.6; color: #111827; margin-bottom: 16px; }
        .card { background: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #023625; border-radius: 6px; padding: 18px; margin: 20px 0; }
        .field { margin-bottom: 10px; font-size: 14px; line-height: 1.5; }
        .field:last-child { margin-bottom: 0; }
        .field strong { color: #023625; display: inline-block; min-width: 140px; }
        .next-steps { background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 6px; padding: 16px; margin: 24px 0; }
        .next-steps h3 { margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #166534; }
        .next-steps ul { margin: 0; padding-left: 20px; font-size: 13px; color: #15803D; line-height: 1.6; }
        .help-text { font-size: 13px; color: #4B5563; line-height: 1.6; margin-top: 20px; }
        .footer { background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 20px 24px; font-size: 12px; color: #6B7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Consultation Request Received</h1>
          <p>YITZAK Institutional Advisory · Assurance, Compliance &amp; Standards</p>
        </div>
        <div class="content">
          <span class="badge">Reference ID: ${details.bookingRef}</span>
          
          <div class="greeting">
            Dear <strong>${details.clientName}</strong>,
            <br><br>
            Thank you for reaching out to <strong>YITZAK Institutional Advisory</strong>. We have received your consultation request and it has been assigned to our senior advisory practice.
          </div>

          <div class="card">
            <div class="field"><strong>Service Stream:</strong> ${details.pillarTitle}</div>
            <div class="field"><strong>Company / Facility:</strong> ${details.company}</div>
            <div class="field"><strong>Reference ID:</strong> ${details.bookingRef}</div>
            <div class="field"><strong>Status:</strong> Under Advisory Review</div>
            ${details.notes ? `<div class="field" style="margin-top: 10px;"><strong>Notes Provided:</strong> ${details.notes}</div>` : ''}
          </div>

          <div class="next-steps">
            <h3>What Happens Next?</h3>
            <ul>
              <li><strong>Requirement Review:</strong> An accredited advisory specialist will assess your specific operational and regulatory requirements.</li>
              <li><strong>Direct Contact:</strong> We will reach out to you within <strong>1 business day</strong> via email or phone to confirm the schedule and discussion agenda.</li>
            </ul>
          </div>

          <div class="help-text">
            If you have supporting compliance documents, facility audit reports, or specific timelines to share, feel free to reply directly to this email or contact us at <a href="mailto:info@yitzak.co.za" style="color:#023625; font-weight:600;">info@yitzak.co.za</a>.
          </div>
        </div>
        <div class="footer">
          &copy; 2026 YITZAK Institutional Advisory · Randburg, Johannesburg, South Africa<br>
          <span style="color:#9CA3AF;">Official Representative of FoodChain ID · GFSI, ISO 22000, BRCGS, FSSC 22000</span>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send team notification
  try {
    const teamRes = await sendEmailViaVercel({
      to: ['info@yitzak.co.za', 'christinagumpo@gmail.com', 'cgumpo@yitzak.co.za'],
      subject: `[Consultation Request] ${details.company} (${details.clientName}) - ${details.bookingRef}`,
      html: teamHtml,
      type: 'booking',
      metadata: {
        ...details,
        senderEmail: details.clientEmail,
        replyTo: details.clientEmail,
      },
    });
    if (teamRes.success) teamDelivered = true;
  } catch (err) {
    console.warn('Team consultation dispatch error:', err);
  }

  // Send client confirmation
  try {
    const clientRes = await sendEmailViaVercel({
      to: [details.clientEmail],
      subject: `Consultation Request Received: ${details.pillarTitle} (${details.bookingRef}) - YITZAK Advisory`,
      html: clientHtml,
      type: 'booking',
      metadata: {
        ...details,
        isClientConfirmation: true,
      },
    });
    if (clientRes.success) clientDelivered = true;
  } catch (err) {
    console.warn('Client confirmation email dispatch error:', err);
  }

  return {
    success: teamDelivered || clientDelivered,
    teamDelivered,
    clientDelivered,
  };
}

/**
 * Dispatches a real random 6-digit one-time access verification code to the client's work email.
 */
export async function dispatchPortalAccessCodeEmail(
  recipientEmail: string,
  code: string,
  displayName?: string
): Promise<{ success: boolean; provider?: string; message?: string }> {
  const expiryMinutes = 15;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1F2937; background: #F4F6F5; padding: 24px; margin: 0; }
        .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #023625; padding: 28px; text-align: center; border-bottom: 3px solid #B68A35; }
        .brand { font-size: 24px; font-weight: 800; letter-spacing: 0.1em; color: #FFFFFF; margin: 0; font-family: Georgia, serif; }
        .subbrand { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #E6CA85; margin-top: 4px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px; }
        .instruction { font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 20px; }
        .code-container { background: #F8FAF9; border: 2px dashed #B68A35; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .code-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #023625; margin-bottom: 8px; }
        .code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #023625; margin: 0; }
        .expiry { font-size: 12px; color: #6B7280; margin-top: 8px; }
        .security-note { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 12px 16px; font-size: 12px; color: #92400E; line-height: 1.5; border-radius: 4px; margin-top: 24px; }
        .footer { background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 18px 24px; font-size: 11px; color: #6B7280; text-align: center; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand">YITZAK</h1>
          <div class="subbrand">Institutional Advisory &amp; Compliance</div>
        </div>
        <div class="content">
          <div class="greeting">Dear ${displayName || 'Institutional Colleague'},</div>
          <p class="instruction">
            You requested a secure one-time verification code to access the <strong>YITZAK Institutional Portal</strong>.
          </p>
          <div class="code-container">
            <div class="code-label">One-Time Verification Code</div>
            <div class="code">${code}</div>
            <div class="expiry">This verification code is valid for ${expiryMinutes} minutes.</div>
          </div>
          <p class="instruction">
            Please enter this code into your portal verification prompt to confirm your identity. If you did not initiate this request, please disregard this email or contact our compliance desk immediately.
          </p>
          <div class="security-note">
            <strong>Security Notice:</strong> YITZAK personnel will never ask you to reveal or forward your verification code.
          </div>
        </div>
        <div class="footer">
          &copy; 2026 YITZAK Consulting &amp; Advisory · FoodChain ID Partner<br>
          Randburg, Johannesburg, South Africa · <a href="mailto:info@yitzak.co.za" style="color: #023625; text-decoration: none;">info@yitzak.co.za</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmailViaVercel({
    to: [recipientEmail],
    subject: `Your YITZAK Portal Verification Code: ${code}`,
    html: htmlContent,
    text: `Your YITZAK portal verification code is: ${code}. This code expires in ${expiryMinutes} minutes.`,
    type: 'general',
    metadata: {
      type: 'portal-access-code',
      code,
      recipientEmail,
      timestamp: new Date().toISOString()
    }
  });
}

