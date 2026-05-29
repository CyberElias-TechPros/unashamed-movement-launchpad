# Content Security Policy (Hosting)

When deploying TTIN, configure these headers at the reverse proxy (Nginx, Cloudflare, Vercel):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https://api.thetimeisnow.org https://www.google-analytics.com; frame-src https://www.youtube.com https://www.instagram.com;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Adjust `connect-src` for your API domain and payment providers.
