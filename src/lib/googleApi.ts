/**
 * Google Workspace APIs Integration Helper (Calendar & Gmail)
 * Uses the dynamic user OAuth accessToken fetched via Firebase Auth.
 */

// Helper to base64url encode strings securely for Gmail raw message format
const base64UrlEncode = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Creates an event in the user's primary Google Calendar.
 */
export async function createCalendarEvent(
  accessToken: string,
  details: {
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    timeSlot: string; // "10:00 - 11:00"
    userEmail: string;
  }
): Promise<string> {
  const [startPart, endPart] = details.timeSlot.split(' - ');
  const startDateTime = `${details.date}T${startPart}:00Z`;
  const endDateTime = `${details.date}T${endPart}:00Z`;

  const eventPayload = {
    summary: `YITZAK Consulting: ${details.title}`,
    description: details.description,
    start: {
      dateTime: startDateTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'UTC',
    },
    attendees: [
      { email: details.userEmail },
      { email: 'cgumpo@yitzak.co.za' },
      { email: 'admin@yitzak.co.za' }
    ],
    reminders: {
      useDefault: true,
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create Google Calendar Event: ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  return data.id as string; // Return event ID
}

/**
 * Sends a stylized confirmation email using the Gmail API.
 */
export async function sendConfirmationEmail(
  accessToken: string,
  details: {
    to: string;
    recipientName: string;
    date: string;
    timeSlot: string;
    pillarName: string;
    notes?: string;
  }
): Promise<void> {
  const subject = `YITZAK Consultation Booking: ${details.pillarName}`;

  // Premium corporate styled HTML email template matching Yitzak aesthetic
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          color: #2B2B2B;
          background-color: #F9F9F9;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #E5E5E5;
          padding: 40px;
        }
        .header {
          border-bottom: 2px solid #023625;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-family: 'Spectral', Georgia, serif;
          font-size: 28px;
          font-weight: bold;
          color: #023625;
          letter-spacing: -0.02em;
        }
        .kicker {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #7d5800;
          margin-bottom: 5px;
        }
        h2 {
          font-family: 'Spectral', Georgia, serif;
          font-size: 22px;
          color: #023625;
          margin: 0 0 15px 0;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #414944;
          margin: 0 0 20px 0;
        }
        .details-box {
          background-color: #F9F9F9;
          border-left: 3px solid #7d5800;
          padding: 20px;
          margin: 30px 0;
        }
        .detail-row {
          margin-bottom: 12px;
          display: flex;
        }
        .detail-row:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #737373;
          width: 120px;
          flex-shrink: 0;
          font-weight: 500;
        }
        .detail-val {
          font-size: 15px;
          color: #2B2B2B;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          border-t: 1px solid #E5E5E5;
          padding-top: 20px;
          font-size: 12px;
          color: #737373;
          text-align: center;
        }
        .btn {
          display: inline-block;
          background-color: #023625;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="kicker">Institutional Consulting & Professional Training</div>
          <div class="logo">YITZAK</div>
        </div>
        
        <h2>Consultation Booking Scheduled</h2>
        <p>Dear ${details.recipientName},</p>
        <p>Your consulting engagement with YITZAK has been successfully registered and synchronized to your calendar. Below are the details of your upcoming consultation.</p>
        
        <div class="details-box">
          <div class="detail-row">
            <span class="detail-label">Service Stream</span>
            <span class="detail-val">${details.pillarName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Scheduled Date</span>
            <span class="detail-val">${details.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Slot</span>
            <span class="detail-val">${details.timeSlot} (UTC)</span>
          </div>
          ${details.notes ? `
          <div class="detail-row">
            <span class="detail-label">Client Notes</span>
            <span class="detail-val">${details.notes}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-val" style="color: #023625;">PENDING APPROVAL</span>
          </div>
        </div>
        
        <p>An institutional advisor will review your corporate requirements and contact you prior to the session. You may modify or cancel this booking directly through your client dashboard.</p>
        
        <a href="https://ais-pre-l4lc3avkfj4hymaoallwdh-667571573229.europe-west2.run.app" class="btn">Access Client Dashboard</a>
        
        <div class="footer">
          &copy; 2026 YITZAK Institutional Consulting. All rights reserved.<br>
          Randburg | South Africa<br>
          This is an automated confirmation of services.
        </div>
      </div>
    </body>
    </html>
  `;

  const rawEmail = [
    `To: ${details.to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailHtml,
  ].join('\r\n');

  const encodedRaw = base64UrlEncode(rawEmail);

  const response = await fetch(
    'https://gmail.googleapis.com/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedRaw,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to send email via Gmail API: ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }
}

/**
 * Sends a stylized cancellation email using the Gmail API.
 */
export async function sendCancellationEmail(
  accessToken: string,
  details: {
    to: string;
    recipientName: string;
    date: string;
    timeSlot: string;
    pillarName: string;
    notes?: string;
  }
): Promise<void> {
  const subject = `YITZAK Consultation Update: Session Cancelled - ${details.pillarName}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          color: #2B2B2B;
          background-color: #F9F9F9;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #E5E5E5;
          padding: 40px;
        }
        .header {
          border-bottom: 2px solid #b91c1c;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-family: 'Spectral', Georgia, serif;
          font-size: 28px;
          font-weight: bold;
          color: #023625;
          letter-spacing: -0.02em;
        }
        .kicker {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #b91c1c;
          margin-bottom: 5px;
          font-weight: bold;
        }
        h2 {
          font-family: 'Spectral', Georgia, serif;
          font-size: 22px;
          color: #023625;
          margin: 0 0 15px 0;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #414944;
          margin: 0 0 20px 0;
        }
        .details-box {
          background-color: #FEF2F2;
          border-left: 3px solid #b91c1c;
          padding: 20px;
          margin: 30px 0;
        }
        .detail-row {
          margin-bottom: 12px;
          display: flex;
        }
        .detail-row:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #737373;
          width: 120px;
          flex-shrink: 0;
          font-weight: 500;
        }
        .detail-val {
          font-size: 15px;
          color: #2B2B2B;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #E5E5E5;
          padding-top: 20px;
          font-size: 12px;
          color: #737373;
          text-align: center;
        }
        .btn {
          display: inline-block;
          background-color: #023625;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="kicker">Session Status Update</div>
          <div class="logo">YITZAK</div>
        </div>
        
        <h2>Consultation Session Cancelled</h2>
        <p>Dear ${details.recipientName},</p>
        <p>This message confirms that your scheduled consultation session with YITZAK has been <strong>cancelled</strong>.</p>
        
        <div class="details-box">
          <div class="detail-row">
            <span class="detail-label">Service Stream</span>
            <span class="detail-val">${details.pillarName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Cancelled Date</span>
            <span class="detail-val">${details.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Slot</span>
            <span class="detail-val">${details.timeSlot} (SAST)</span>
          </div>
          ${details.notes ? `
          <div class="detail-row">
            <span class="detail-label">Session Notes</span>
            <span class="detail-val">${details.notes}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-val" style="color: #b91c1c;">CANCELLED</span>
          </div>
        </div>
        
        <p>If you would like to reschedule your consultation or discuss alternative dates, you can visit our booking portal or contact us directly at <a href="mailto:info@yitzak.co.za" style="color:#023625; font-weight:600;">info@yitzak.co.za</a>.</p>
        
        <a href="https://ais-pre-l4lc3avkfj4hymaoallwdh-667571573229.europe-west2.run.app" class="btn">Reschedule Consultation</a>
        
        <div class="footer">
          &copy; 2026 YITZAK Institutional Consulting. All rights reserved.<br>
          Randburg | South Africa<br>
          This is an automated status notification.
        </div>
      </div>
    </body>
    </html>
  `;

  const rawEmail = [
    `To: ${details.to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailHtml,
  ].join('\r\n');

  const encodedRaw = base64UrlEncode(rawEmail);

  const response = await fetch(
    'https://gmail.googleapis.com/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedRaw,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to send cancellation email via Gmail API: ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }
}

/**
 * Sends a stylized General Contact Inquiry to support.
 */
export async function sendContactInquiryEmail(
  accessToken: string,
  details: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
  }
): Promise<void> {
  const mailSubject = `[YITZAK Inquiry] ${details.subject}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          color: #2B2B2B;
          background-color: #F9F9F9;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #E5E5E5;
          padding: 40px;
        }
        .header {
          border-bottom: 2px solid #023625;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-family: 'Spectral', Georgia, serif;
          font-size: 28px;
          font-weight: bold;
          color: #023625;
          letter-spacing: -0.02em;
        }
        .kicker {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #7d5800;
          margin-bottom: 5px;
        }
        h2 {
          font-family: 'Spectral', Georgia, serif;
          font-size: 22px;
          color: #023625;
          margin: 0 0 15px 0;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #414944;
          margin: 0 0 20px 0;
        }
        .details-box {
          background-color: #F9F9F9;
          border-left: 3px solid #7d5800;
          padding: 20px;
          margin: 30px 0;
        }
        .detail-row {
          margin-bottom: 12px;
          display: flex;
        }
        .detail-row:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #737373;
          width: 120px;
          flex-shrink: 0;
          font-weight: 500;
        }
        .detail-val {
          font-size: 15px;
          color: #2B2B2B;
          font-weight: 600;
        }
        .message-body {
          background: #ffffff;
          border: 1px solid #E5E5E5;
          padding: 15px;
          margin-top: 10px;
          font-size: 14px;
          color: #2B2B2B;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #E5E5E5;
          padding-top: 20px;
          font-size: 12px;
          color: #737373;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="kicker">General Contact Form Submission</div>
          <div class="logo">YITZAK</div>
        </div>
        
        <h2>New Inquiry Submitted</h2>
        <p>A visitor has sent a general inquiry using the 'Contact Us' form. Here are the submission details:</p>
        
        <div class="details-box">
          <div class="detail-row">
            <span class="detail-label">Enquirer Name</span>
            <span class="detail-val">${details.senderName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Enquirer Email</span>
            <span class="detail-val">${details.senderEmail}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Subject</span>
            <span class="detail-val">${details.subject}</span>
          </div>
          <div style="margin-top: 15px;">
            <span class="detail-label">Message:</span>
            <div class="message-body">${details.message}</div>
          </div>
        </div>
        
        <p>This inquiry has been logged for tracking and prompt response by our advisory team.</p>
        
        <div class="footer">
          &copy; 2026 YITZAK Institutional Consulting. All rights reserved.<br>
          Randburg | South Africa<br>
          This is an automated delivery of client communications.
        </div>
      </div>
    </body>
    </html>
  `;

  // We send the email to institutional support and advisory lead
  const rawEmail = [
    `To: cgumpo@yitzak.co.za, admin@yitzak.co.za`,
    `Cc: ${details.senderEmail}`,
    `Subject: ${mailSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailHtml,
  ].join('\r\n');

  const encodedRaw = base64UrlEncode(rawEmail);

  const response = await fetch(
    'https://gmail.googleapis.com/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedRaw,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to forward inquiry email via Gmail API: ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }
}

