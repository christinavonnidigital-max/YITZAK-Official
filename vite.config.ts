import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Allows both VITE_ and FIREBASE_ prefixed environment variables from Vercel / .env
    envPrefix: ['VITE_', 'FIREBASE_'],
    define: {
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || ''),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN || ''),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || ''),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET || ''),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID || ''),
      'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(env.FIREBASE_MEASUREMENT_ID || env.VITE_FIREBASE_MEASUREMENT_ID || ''),
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-send-email-dev-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/send-email' && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', (chunk) => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr || '{}');
                  const { to, subject, html, text, metadata } = body;
                  const recipientList = Array.isArray(to) ? to : [to];

                  const resendApiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
                  if (resendApiKey) {
                    const fromEmail = process.env.RESEND_FROM_EMAIL || env.RESEND_FROM_EMAIL || 'YITZAK Advisory <advisory@notifications.yitzak.co.za>';
                    const r = await fetch('https://api.resend.com/emails', {
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
                    const rData = await r.json();
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ success: r.ok, provider: 'resend', data: rData }));
                  }

                  const sendgridApiKey = process.env.SENDGRID_API_KEY || env.SENDGRID_API_KEY;
                  if (sendgridApiKey) {
                    const fromEmail = process.env.SENDGRID_FROM_EMAIL || env.SENDGRID_FROM_EMAIL || 'info@yitzak.co.za';
                    const sg = await fetch('https://api.sendgrid.com/v3/mail/send', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${sendgridApiKey}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        personalizations: [{ to: recipientList.map((e: string) => ({ email: e })) }],
                        from: { email: fromEmail, name: 'YITZAK Advisory' },
                        subject: subject,
                        content: [{ type: 'text/html', value: html || `<p>${text}</p>` }],
                      }),
                    });
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ success: sg.ok || sg.status === 202, provider: 'sendgrid' }));
                  }

                  console.log('[Dev Server Email Dispatcher] Processed:', { to: recipientList, subject, metadata });
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({
                    success: true,
                    provider: 'dev-server',
                    message: `Email dispatched to ${recipientList.join(', ')}`,
                  }));
                } catch (e: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ error: e?.message }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
