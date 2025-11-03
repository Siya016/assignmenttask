# Deploy to Vercel - Solar Ops Mini-Cockpit

## 🚀 Quick Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
cd solar-mini-cockpit
vercel --prod
```

## ⚙️ Environment Variables Setup

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=production
```

### Get Gemini API Key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key
4. Add to Vercel environment variables

## 📁 Project Configuration

### vercel.json (Optional)
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Build Settings (Auto-detected)
- **Framework**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next` (auto)
- **Install Command**: `pnpm install`

## 🔧 Deployment Steps

### Method 1: CLI Deployment
```bash
# From project directory
vercel

# Follow prompts:
# ? Set up and deploy "~/solar-mini-cockpit"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? solar-mini-cockpit
# ? In which directory is your code located? ./
```

### Method 2: Git Integration
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Connect repository
4. Configure environment variables
5. Deploy automatically on push

## 🌐 Custom Domain (Optional)

### Add Custom Domain:
1. Go to project settings in Vercel
2. Navigate to "Domains"
3. Add your domain (e.g., `solar-ops.yourdomain.com`)
4. Configure DNS records as instructed

## 📊 Performance Optimization

### Vercel automatically handles:
- **CDN**: Global edge network
- **Compression**: Gzip/Brotli compression
- **Caching**: Static assets cached at edge
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Available in dashboard

### Current Performance:
- **LCP**: 1.72s ✅
- **CLS**: 0.0006 ✅
- **TTI**: Optimized with dynamic imports

## 🔍 Monitoring

### Vercel Analytics (Built-in):
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Function execution logs
- Error tracking

### Access Analytics:
1. Go to project dashboard
2. Click "Analytics" tab
3. View performance metrics

## 🐛 Troubleshooting

### Common Issues:

#### Build Fails
```bash
# Check build locally first
pnpm build

# If successful locally, check Vercel build logs
vercel logs
```

#### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

#### API Routes 404
- Ensure `/api/agent/route.ts` is in correct location
- Check Next.js App Router structure
- Verify API routes work locally

#### Performance Issues
- Check bundle size: `pnpm build --analyze`
- Monitor Vercel function execution time
- Review Core Web Vitals in analytics

## 🔄 Continuous Deployment

### Automatic Deployments:
1. Connect GitHub repository
2. Every push to `main` branch deploys to production
3. Pull requests create preview deployments
4. Environment variables sync automatically

### Manual Deployments:
```bash
# Deploy specific branch
vercel --prod --branch feature-branch

# Deploy with specific environment
vercel --prod --env GEMINI_API_KEY=new-key
```

## 📋 Deployment Checklist

- [ ] Gemini API key configured
- [ ] Build passes locally (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (if needed)
- [ ] Analytics enabled
- [ ] Performance metrics reviewed

## 🎯 Post-Deployment

### Test Your Deployment:
1. Visit your Vercel URL
2. Upload test XLSX files
3. Verify all 3 rule types generate events
4. Test AI analysis (MODEL ON/OFF)
5. Check /logs page functionality
6. Verify performance with Lighthouse

### Your app is now live! 🎉

**Example URL**: `https://solar-mini-cockpit.vercel.app`