const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

// Live preview endpoint
router.post('/api/preview', async (req, res) => {
  try {
    // Store preview data temporarily
    const previewData = {
      ...req.body,
      timestamp: Date.now(),
      preview: true
    };
    
    // Save to temporary preview file
    const previewPath = path.join(__dirname, '../../data/portfolio-preview.json');
    await fs.writeJSON(previewPath, previewData, { spaces: 2 });
    
    res.json({ success: true, message: 'Preview updated' });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to update preview' });
  }
});

// Serve preview data
router.get('/api/preview', async (req, res) => {
  try {
    const previewPath = path.join(__dirname, '../../data/portfolio-preview.json');
    const mainPath = path.join(__dirname, '../../data/portfolio.json');
    
    // Always start with current portfolio data as base
    let data = {};
    if (await fs.pathExists(mainPath)) {
      data = await fs.readJSON(mainPath);
    }
    
    // If preview data exists, merge it with current data
    if (await fs.pathExists(previewPath)) {
      const previewData = await fs.readJSON(previewPath);
      // Merge preview changes over current data
      data = { ...data, ...previewData };
      
      // Add preview indicator to profile name if not already there
      if (data.profile && !data.profile.name?.includes('(Preview)')) {
        data.profile.name = `${data.profile.name} (Preview)`;
      }
    }
    
    res.json(data);
  } catch (error) {
    console.error('Preview fetch error:', error);
    res.status(500).json({ error: 'Failed to load preview' });
  }
});

// Preview HTML page (like main portfolio but with preview data)
router.get('/preview', async (req, res) => {
  try {
    // Read the main index.html
    const indexPath = path.join(__dirname, '../../public/index.html');
    
    // Check if file exists
    if (!await fs.pathExists(indexPath)) {
      console.error('Index file not found at:', indexPath);
      return res.status(404).send('Index file not found');
    }
    
    let html = await fs.readFile(indexPath, 'utf8');
    
    // Replace the API endpoint in the HTML to use preview data
    html = html.replace(/\/api\/portfolio/g, '/admin/api/preview');
    
    // Add preview indicator
    const previewBanner = `
    <div style="position: fixed; top: 0; left: 0; right: 0; z-index: 1000; 
                background: #f59e0b; color: white; padding: 8px; text-align: center; 
                font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      📝 PREVIEW MODE - Changes are not published
    </div>
    <style>body { padding-top: 40px !important; }</style>
    `;
    
    html = html.replace('</head>', previewBanner + '</head>');
    
    res.send(html);
  } catch (error) {
    console.error('Preview page error:', error);
    res.status(500).send(`Preview unavailable: ${error.message}`);
  }
});

module.exports = router;