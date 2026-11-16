import JSZip from 'jszip';
import type { BlogPost, Listing, ServiceOffering, SiteContent } from '../types/purecrest';

export async function downloadCloudflareBundle(params: {
  siteContent: SiteContent;
  listings: Listing[];
  services: ServiceOffering[];
  posts: BlogPost[];
  firestoreRules: string;
}): Promise<void> {
  const zip = new JSZip();

  zip.file(
    'wrangler.jsonc',
    JSON.stringify(
      {
        $schema: 'node_modules/wrangler/config-schema.json',
        name: 'purecrest-platform',
        compatibility_date: '2026-11-01',
        pages_build_output_dir: './dist',
        vars: {
          APP_ENV: 'production',
          SITE_DOMAIN: 'www.purecrest.ng',
        },
      },
      null,
      2,
    ),
  );

  zip.file('public/_redirects', '/* /index.html 200\n');
  zip.file(
    'public/_headers',
    [
      '/*',
      '  X-Frame-Options: SAMEORIGIN',
      '  X-Content-Type-Options: nosniff',
      '  Referrer-Policy: strict-origin-when-cross-origin',
      '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
      '',
      '/assets/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '',
    ].join('\n'),
  );

  zip.file('firestore.rules', params.firestoreRules);

  const cmsFolder = zip.folder('cms-snapshot');
  cmsFolder?.file('siteContent.json', JSON.stringify(params.siteContent, null, 2));
  cmsFolder?.file('listings.json', JSON.stringify(params.listings, null, 2));
  cmsFolder?.file('services.json', JSON.stringify(params.services, null, 2));
  cmsFolder?.file('posts.json', JSON.stringify(params.posts, null, 2));

  zip.file(
    'CLOUDFLARE_DEPLOY.md',
    [
      '# PureCrest — Cloudflare Pages Deployment Package',
      '',
      `Exported: ${new Date().toISOString()}`,
      '',
      '## Quick Deploy Commands',
      '1. npm install',
      '2. npm run build',
      '3. npx wrangler pages deploy dist --project-name=purecrest-platform',
      '',
      '## Domain & Firebase Setup',
      '- Bind custom domain www.purecrest.ng in Cloudflare Workers & Pages.',
      '- Add www.purecrest.ng and *.pages.dev in Firebase Authentication -> Authorized Domains.',
      '- Deploy firestore.rules with: firebase deploy --only firestore:rules',
      '',
    ].join('\n'),
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `purecrest-cloudflare-bundle-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
