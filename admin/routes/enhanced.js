const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
    }
  }
});

// ========================================
// MEDIA LIBRARY ROUTES
// ========================================

// Get media library
router.get('/api/media', requireAuth, async (req, res) => {
  try {
    const mediaFile = path.join(__dirname, '../../data/media.json');
    let mediaData = [];
    
    if (await fs.pathExists(mediaFile)) {
      mediaData = await fs.readJson(mediaFile);
    }
    
    res.json(mediaData);
  } catch (error) {
    console.error('Error loading media library:', error);
    res.status(500).json({ error: 'Failed to load media library' });
  }
});

// Upload media file
router.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mediaItem = {
      id: Date.now().toString(),
      name: req.file.originalname,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'document',
      size: formatFileSize(req.file.size),
      uploadDate: new Date().toISOString()
    };

    // Save to media library
    const mediaFile = path.join(__dirname, '../../data/media.json');
    let mediaData = [];
    
    if (await fs.pathExists(mediaFile)) {
      mediaData = await fs.readJson(mediaFile);
    }
    
    mediaData.push(mediaItem);
    await fs.writeJson(mediaFile, mediaData, { spaces: 2 });

    res.json({ success: true, data: mediaItem });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete media file
router.delete('/api/media/:id', requireAuth, async (req, res) => {
  try {
    const mediaId = req.params.id;
    const mediaFile = path.join(__dirname, '../../data/media.json');
    
    if (await fs.pathExists(mediaFile)) {
      let mediaData = await fs.readJson(mediaFile);
      const mediaItem = mediaData.find(item => item.id === mediaId);
      
      if (mediaItem) {
        // Delete physical file
        const filePath = path.join(__dirname, '../../public/uploads', mediaItem.filename);
        if (await fs.pathExists(filePath)) {
          await fs.unlink(filePath);
        }
        
        // Remove from media library
        mediaData = mediaData.filter(item => item.id !== mediaId);
        await fs.writeJson(mediaFile, mediaData, { spaces: 2 });
        
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Media file not found' });
      }
    } else {
      res.status(404).json({ error: 'Media library not found' });
    }
  } catch (error) {
    console.error('Error deleting media file:', error);
    res.status(500).json({ error: 'Failed to delete media file' });
  }
});

// ========================================
// SOCIAL MEDIA ROUTES
// ========================================

// Get social connections
router.get('/api/social', requireAuth, async (req, res) => {
  try {
    const socialFile = path.join(__dirname, '../../data/social.json');
    let socialData = {};
    
    if (await fs.pathExists(socialFile)) {
      socialData = await fs.readJson(socialFile);
    }
    
    res.json(socialData);
  } catch (error) {
    console.error('Error loading social connections:', error);
    res.status(500).json({ error: 'Failed to load social connections' });
  }
});

// Update social connections
router.put('/api/social', requireAuth, async (req, res) => {
  try {
    const socialFile = path.join(__dirname, '../../data/social.json');
    await fs.writeJson(socialFile, req.body, { spaces: 2 });
    res.json({ success: true, data: req.body });
  } catch (error) {
    console.error('Error updating social connections:', error);
    res.status(500).json({ error: 'Failed to update social connections' });
  }
});

// ========================================
// ANALYTICS ROUTES
// ========================================

// Get analytics data
router.get('/api/analytics', requireAuth, async (req, res) => {
  try {
    // In a real implementation, this would connect to Google Analytics or similar
    const analyticsData = {
      pageViews: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [120, 190, 300, 500, 200, 300]
      },
      visitors: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        data: [65, 30, 5]
      },
      performance: {
        loadTime: 1.2,
        seoScore: 85,
        accessibility: 92,
        bestPractices: 88
      },
      traffic: {
        organic: 65,
        direct: 20,
        social: 10,
        referral: 5
      }
    };
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Error loading analytics:', error);
    res.status(500).json({ error: 'Failed to load analytics data' });
  }
});

// ========================================
// SEO ROUTES
// ========================================

// Get SEO data
router.get('/api/seo', requireAuth, async (req, res) => {
  try {
    const seoFile = path.join(__dirname, '../../data/seo.json');
    let seoData = {
      title: '',
      description: '',
      keywords: '',
      openGraph: {
        title: '',
        description: '',
        image: '',
        url: ''
      },
      twitterCards: {
        card: 'summary_large_image',
        title: '',
        description: '',
        image: ''
      }
    };
    
    if (await fs.pathExists(seoFile)) {
      seoData = await fs.readJson(seoFile);
    }
    
    res.json(seoData);
  } catch (error) {
    console.error('Error loading SEO data:', error);
    res.status(500).json({ error: 'Failed to load SEO data' });
  }
});

// Update SEO data
router.put('/api/seo', requireAuth, async (req, res) => {
  try {
    const seoFile = path.join(__dirname, '../../data/seo.json');
    await fs.writeJson(seoFile, req.body, { spaces: 2 });
    res.json({ success: true, data: req.body });
  } catch (error) {
    console.error('Error updating SEO data:', error);
    res.status(500).json({ error: 'Failed to update SEO data' });
  }
});

// ========================================
// INTEGRATIONS ROUTES
// ========================================

// Get integrations status
router.get('/api/integrations', requireAuth, async (req, res) => {
  try {
    const integrationsFile = path.join(__dirname, '../../data/integrations.json');
    let integrationsData = {};
    
    if (await fs.pathExists(integrationsFile)) {
      integrationsData = await fs.readJson(integrationsFile);
    }
    
    res.json(integrationsData);
  } catch (error) {
    console.error('Error loading integrations:', error);
    res.status(500).json({ error: 'Failed to load integrations' });
  }
});

// Update integration
router.put('/api/integrations/:name', requireAuth, async (req, res) => {
  try {
    const integrationName = req.params.name;
    const integrationsFile = path.join(__dirname, '../../data/integrations.json');
    
    let integrationsData = {};
    if (await fs.pathExists(integrationsFile)) {
      integrationsData = await fs.readJson(integrationsFile);
    }
    
    integrationsData[integrationName] = req.body;
    await fs.writeJson(integrationsFile, integrationsData, { spaces: 2 });
    
    res.json({ success: true, data: integrationsData[integrationName] });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// ========================================
// TOOLS ROUTES
// ========================================

// Run SEO check
router.post('/api/tools/seo-check', requireAuth, async (req, res) => {
  try {
    // Simulate SEO analysis
    const seoResults = {
      score: Math.floor(Math.random() * 15) + 85, // 85-100
      checks: [
        { name: 'Meta Title', status: 'pass', message: 'Title is appropriate length' },
        { name: 'Meta Description', status: 'pass', message: 'Description is well optimized' },
        { name: 'H1 Tags', status: 'warning', message: 'Consider adding more H1 tags' },
        { name: 'Alt Text', status: 'pass', message: 'Images have proper alt text' },
        { name: 'Page Speed', status: 'pass', message: 'Page loads quickly' }
      ]
    };
    
    res.json({ success: true, results: seoResults });
  } catch (error) {
    console.error('Error running SEO check:', error);
    res.status(500).json({ error: 'Failed to run SEO check' });
  }
});

// Run performance test
router.post('/api/tools/performance', requireAuth, async (req, res) => {
  try {
    // Simulate performance test
    const performanceResults = {
      loadTime: (Math.random() * 2 + 0.8).toFixed(2), // 0.8-2.8s
      firstContentfulPaint: (Math.random() * 1.5 + 0.5).toFixed(2),
      largestContentfulPaint: (Math.random() * 3 + 1).toFixed(2),
      totalBlockingTime: (Math.random() * 200 + 50).toFixed(0),
      cumulativeLayoutShift: (Math.random() * 0.1).toFixed(3)
    };
    
    res.json({ success: true, results: performanceResults });
  } catch (error) {
    console.error('Error running performance test:', error);
    res.status(500).json({ error: 'Failed to run performance test' });
  }
});

// Run accessibility check
router.post('/api/tools/accessibility', requireAuth, async (req, res) => {
  try {
    // Simulate accessibility check
    const accessibilityResults = {
      score: Math.floor(Math.random() * 10) + 90, // 90-100
      issues: [
        { type: 'info', message: 'Consider increasing color contrast ratio', element: 'button.secondary' },
        { type: 'warning', message: 'Missing skip navigation link', element: 'nav' }
      ],
      passed: [
        'Images have alt attributes',
        'Form elements have labels',
        'Page has proper heading structure',
        'Links have descriptive text'
      ]
    };
    
    res.json({ success: true, results: accessibilityResults });
  } catch (error) {
    console.error('Error running accessibility check:', error);
    res.status(500).json({ error: 'Failed to run accessibility check' });
  }
});

// Test email integration
router.post('/api/tools/email-test', requireAuth, async (req, res) => {
  try {
    // Simulate email test
    const testResults = {
      success: true,
      message: 'Test email sent successfully',
      details: {
        service: 'EmailJS',
        template: 'contact_form',
        recipient: 'test@example.com',
        sentAt: new Date().toISOString()
      }
    };
    
    res.json(testResults);
  } catch (error) {
    console.error('Error testing email integration:', error);
    res.status(500).json({ error: 'Failed to test email integration' });
  }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;