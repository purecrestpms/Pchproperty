# PureCrest — Cloudflare Pages Deployment Guide

## Prerequisites
- Node.js 20+
- A Cloudflare account (`npx wrangler login`)
- Your Firebase project (`firebase-applet-config.json` already configured)

## Build & Deploy to Cloudflare Pages
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the production static bundle:
   ```bash
   npm run build
   ```
3. Deploy directly to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=purecrest-platform
   ```
4. Attach your custom domain `www.purecrest.ng` inside **Cloudflare Dashboard -> Workers & Pages -> purecrest-platform -> Custom Domains**.
5. Add `www.purecrest.ng` and `purecrest-platform.pages.dev` to **Firebase Console -> Authentication -> Settings -> Authorized Domains**.
