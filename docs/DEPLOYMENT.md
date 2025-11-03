# Deployment Guide - Solar Ops Mini-Cockpit

## Production Deployment

### Prerequisites
- Node.js 18+ runtime environment
- Google Cloud Project with Vertex AI enabled
- Service account with AI Platform User role
- SSL certificate for HTTPS (recommended)

### Environment Setup

1. **Create Production Environment File**
```bash
cp .env.example .env.production
```

2. **Configure Variables**
```bash
# .env.production
NODE_ENV=production
GOOGLE_CLOUD_PROJECT=your-production-project
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account.json
```

### Build and Deploy

#### Option 1: Traditional Server

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build

# Start production server
pnpm start
```

#### Option 2: Docker Container

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Runtime
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t solar-ops-cockpit .
docker run -p 3000:3000 \
  -v /path/to/credentials:/app/credentials \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account.json \
  solar-ops-cockpit
```

#### Option 3: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Note: File-based credentials need alternative setup
```

### Google Cloud Setup

#### 1. Create Service Account
```bash
gcloud iam service-accounts create solar-ops-prod \
  --display-name="Solar Ops Production"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:solar-ops-prod@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

#### 2. Generate Credentials
```bash
gcloud iam service-accounts keys create service-account.json \
  --iam-account=solar-ops-prod@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### 3. Enable Required APIs
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable compute.googleapis.com
```

### Performance Optimization

#### 1. CDN Configuration
```nginx
# nginx.conf
location /_next/static/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location /api/ {
  proxy_pass http://localhost:3000;
  proxy_cache_valid 200 5m;
}
```

#### 2. Compression
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

#### 3. Database Optimization (if added)
```sql
-- Index for time-based queries
CREATE INDEX idx_solar_data_timestamp ON solar_data(timestamp);
CREATE INDEX idx_events_site_timestamp ON events(site, timestamp);
```

### Monitoring Setup

#### 1. Health Check Endpoint
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

#### 2. Application Monitoring
```bash
# Install monitoring agent
npm install @google-cloud/monitoring

# Set up alerts for:
# - Response time > 5s
# - Error rate > 5%
# - Memory usage > 80%
```

#### 3. Log Aggregation
```javascript
// lib/logger.ts production config
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new LoggingWinston(),
    new winston.transports.Console(),
  ],
});
```

### Security Hardening

#### 1. Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

#### 2. Rate Limiting
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const limit = rateLimit.get(ip) ?? { count: 0, lastReset: Date.now() };

  if (Date.now() - limit.lastReset > 60000) {
    limit.count = 0;
    limit.lastReset = Date.now();
  }

  if (limit.count > 100) { // 100 requests per minute
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  limit.count++;
  rateLimit.set(ip, limit);

  return NextResponse.next();
}
```

### Backup and Recovery

#### 1. Configuration Backup
```bash
# Backup environment and configs
tar -czf backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  next.config.js \
  package.json \
  pnpm-lock.yaml
```

#### 2. Disaster Recovery Plan
1. **RTO**: 15 minutes (Recovery Time Objective)
2. **RPO**: 1 hour (Recovery Point Objective)
3. **Backup Strategy**: Daily config backups, real-time monitoring
4. **Failover**: Load balancer with health checks

### Scaling Considerations

#### Horizontal Scaling
```yaml
# kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: solar-ops-cockpit
spec:
  replicas: 3
  selector:
    matchLabels:
      app: solar-ops-cockpit
  template:
    spec:
      containers:
      - name: app
        image: solar-ops-cockpit:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### Vertical Scaling
- **Memory**: 512MB minimum, 2GB recommended for large datasets
- **CPU**: 2 cores minimum for AI processing
- **Storage**: 10GB for logs and temporary files

### Troubleshooting

#### Common Issues

1. **AI API Failures**
   - Check service account permissions
   - Verify Vertex AI API is enabled
   - Monitor quota limits

2. **Performance Issues**
   - Enable Next.js analytics
   - Check bundle size with `pnpm build --analyze`
   - Monitor Core Web Vitals

3. **Memory Leaks**
   - Monitor Node.js heap usage
   - Check for unclosed file handles
   - Review chart component cleanup

#### Debug Commands
```bash
# Check service health
curl https://your-domain.com/api/health

# Monitor logs
docker logs -f solar-ops-cockpit

# Performance profiling
NODE_ENV=production node --inspect server.js
```