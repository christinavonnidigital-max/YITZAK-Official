import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  images?: Array<{ loc: string; title: string; caption?: string }>;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.yitzak.co.za';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;
  const currentDate = new Date().toISOString().split('T')[0];

  const routes: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0',
      images: [
        {
          loc: `${baseUrl}/og-image.png`,
          title: 'YITZAK | Professional Training, Advisory & Certification Preparation',
          caption: 'Developing Competence. Enabling Compliance.'
        },
        {
          loc: `${baseUrl}/YITZAK-logo-green.png`,
          title: 'YITZAK Official Logo'
        }
      ]
    },
    {
      url: `${baseUrl}/services/training`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/services/certifications`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/services/consulting`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/services/business-process-implementation`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/training-calendar`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/knowledge-centre`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/privacy-notice`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4'
    }
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
  .map(
    (r) => `  <url>
    <loc>${r.url}</loc>
    <lastmod>${r.lastmod || currentDate}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>${
      r.images
        ? '\n' +
          r.images
            .map(
              (img) => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title.replace(/&/g, '&amp;')}</image:title>${
        img.caption ? `\n      <image:caption>${img.caption.replace(/&/g, '&amp;')}</image:caption>` : ''
      }
    </image:image>`
            )
            .join('\n')
        : ''
    }
  </url>`
  )
  .join('\n\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  return res.status(200).send(xml);
}
