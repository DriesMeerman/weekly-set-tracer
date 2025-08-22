# Deployment Guide

## GitHub Pages Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**

### 2. Push Your Code

The GitHub Action will automatically run when you push to the main branch:

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

### 3. Monitor Deployment

1. Go to **Actions** tab in your repository
2. Watch the "Deploy to GitHub Pages" workflow run
3. Wait for the green checkmark ✅

### 4. Access Your Live App

Your app will be available at:
```
https://[YOUR_USERNAME].github.io/laila-muslce/
```

## Troubleshooting

### Build Fails
- Check the **Actions** tab for error details
- Ensure all dependencies are in `package.json`
- Verify the build script works locally: `npm run build`

### Page Not Found (404)
- Wait a few minutes after deployment
- Check if the repository is public
- Verify the repository name matches exactly

### Assets Not Loading
- Ensure all file paths are relative (not absolute)
- Check that the build output is in the `dist/` folder
- Verify the GitHub Action uploaded the correct files

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file in the `dist/` folder with your domain
2. Configure DNS records to point to GitHub Pages
3. Update the domain in repository settings

## Manual Deployment

If you prefer manual deployment:

```bash
npm run build
# Upload dist/ folder contents to your web server
```
