# GitHub Pages Setup Guide

## 🔧 Enable GitHub Pages

You're getting a 404 because GitHub Pages needs to be enabled. Here are two ways to fix it:

---

## **Method 1: Enable via GitHub Website** (Easiest)

### Steps:

1. **Go to Repository Settings:**
   - Visit: https://github.com/paxiitdevteam/paxi-technologies-website/settings/pages

2. **Configure GitHub Pages:**
   - Under "Source", select:
     - **Branch**: `main`
     - **Folder**: `/ (root)`
   - Click **"Save"**

3. **Wait 1-2 minutes** for GitHub to build your site

4. **Access your site:**
   - URL: `https://paxiitdevteam.github.io/paxi-technologies-website/`

---

## **Method 2: Using GitHub Actions** (Already Set Up)

I've created a GitHub Actions workflow file (`.github/workflows/pages.yml`) that will automatically deploy your site.

### Steps:

1. **Push the workflow file** (if not already pushed):
   ```bash
   git add .github/workflows/pages.yml
   git commit -m "Add GitHub Pages deployment workflow"
   git push
   ```

2. **Enable GitHub Pages:**
   - Go to: https://github.com/paxiitdevteam/paxi-technologies-website/settings/pages
   - Under "Source", select:
     - **Source**: `GitHub Actions` (instead of "Deploy from a branch")
   - Click **"Save"**

3. **The workflow will automatically deploy** on every push to `main`

---

## ⚠️ Important Notes

### For Static Sites (Your Case):

Since you're using a Python server (`server.py`) for local development, but GitHub Pages serves static files:

1. **GitHub Pages will serve your HTML/CSS/JS directly**
2. **The Python server (`server.py`) won't run on GitHub Pages**
3. **All your files will work** - GitHub Pages serves static files perfectly

### File Structure:

Your `index.html` is in the root, which is perfect for GitHub Pages! ✅

---

## 🔍 Troubleshooting

### If you still get 404 after enabling:

1. **Check the repository is public** (or you have GitHub Pro)
   - GitHub Pages is free for public repos
   - Private repos require GitHub Pro

2. **Wait a few minutes** - GitHub Pages can take 1-5 minutes to build

3. **Check the Actions tab:**
   - Go to: https://github.com/paxiitdevteam/paxi-technologies-website/actions
   - See if there are any build errors

4. **Verify the URL:**
   - Make sure you're using: `https://paxiitdevteam.github.io/paxi-technologies-website/`
   - Note: It's `paxiitdevteam.github.io` (not `github.com`)

---

## 📝 Quick Fix Commands

If you need to push the workflow file:

```bash
cd "c:/Users/PC-PAXIIT/Desktop/Paxi Technologies"
git add .github/workflows/pages.yml
git commit -m "Add GitHub Pages deployment workflow"
git push
```

Then enable GitHub Pages in settings as described above.

---

## ✅ After Setup

Once enabled, your site will be available at:
**https://paxiitdevteam.github.io/paxi-technologies-website/**

The site will automatically update whenever you push changes to the `main` branch!
