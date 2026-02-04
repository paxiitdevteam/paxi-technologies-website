# Deployment Guide

## 🚀 Deploying to GitHub Pages

### Step 1: Push to GitHub

```bash
cd "c:/Users/PC-PAXIIT/Desktop/Paxi Technologies"
git add .
git commit -m "Initial commit: Complete Paxi Technologies website"
git remote add origin https://github.com/paxiitdevteam/paxi-technologies-website.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to: https://github.com/paxiitdevteam/paxi-technologies-website/settings/pages
2. Under "Source", select branch: `main`
3. Select folder: `/ (root)`
4. Click "Save"
5. Your site will be live at: `https://paxiitdevteam.github.io/paxi-technologies-website/`

### Step 3: Custom Domain (Optional)

1. Add `CNAME` file in root with your domain:
   ```
   www.paxitechnologies.com
   ```
2. Configure DNS:
   - Type: `CNAME`
   - Name: `www`
   - Value: `paxiitdevteam.github.io`

---

## 🔒 Protecting Sensitive Files

All sensitive files are automatically excluded from Git:

✅ **Protected Files:**
- `config.js` - API keys and secrets
- `.env` files - Environment variables
- `*.key`, `*.pem` - Certificates
- Database files
- Log files

✅ **Safe to Commit:**
- `config.example.js` - Template without secrets
- All source code
- Documentation files

---

## 📋 Pre-Deployment Checklist

- [ ] All sensitive data removed from committed files
- [ ] `config.js` is in `.gitignore` (not committed)
- [ ] Test all features locally
- [ ] Check all links work
- [ ] Verify images load correctly
- [ ] Test chat widget functionality
- [ ] Check mobile responsiveness
- [ ] Verify analytics (if enabled)
- [ ] Test contact form

---

## 🌐 Alternative Hosting Options

### Netlify
1. Connect GitHub repository
2. Build command: (none - static site)
3. Publish directory: `/`
4. Deploy automatically on push

### Vercel
1. Import GitHub repository
2. Framework: Other
3. Deploy automatically

### AWS S3 + CloudFront
1. Upload files to S3 bucket
2. Enable static website hosting
3. Configure CloudFront for CDN
4. Set up custom domain

---

## 🔧 Environment-Specific Configuration

### Development (Local)
- Uses `config.js` if available
- Falls back to defaults
- Custom chat widget enabled

### Production
- Use environment variables
- Or configure via hosting platform
- Enable live chat service
- Enable analytics

---

**Repository:** https://github.com/paxiitdevteam/paxi-technologies-website
