const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const PORTFOLIO_FILE = path.join(__dirname, '../../data/portfolio.json');

// Get portfolio data
router.get('/api/portfolio', requireAuth, async (req, res) => {
  try {
    const data = await fs.readJson(PORTFOLIO_FILE);
    res.json(data);
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    res.status(500).json({ error: 'Failed to load portfolio data' });
  }
});

// Update profile information
router.put('/api/portfolio/profile', requireAuth, async (req, res) => {
  try {
    const data = await fs.readJson(PORTFOLIO_FILE);
    data.profile = { ...data.profile, ...req.body };
    await fs.writeJson(PORTFOLIO_FILE, data, { spaces: 2 });
    res.json({ success: true, data: data.profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update about section
router.put('/api/portfolio/about', requireAuth, async (req, res) => {
  try {
    const data = await fs.readJson(PORTFOLIO_FILE);
    data.about = { ...data.about, ...req.body };
    await fs.writeJson(PORTFOLIO_FILE, data, { spaces: 2 });
    res.json({ success: true, data: data.about });
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({ error: 'Failed to update about section' });
  }
});

// Add new experience
router.post('/api/portfolio/experience', requireAuth, async (req, res) => {
  try {
    const data = await fs.readJson(PORTFOLIO_FILE);
    const newId = Math.max(...data.experience.map(exp => exp.id), 0) + 1;
    const newExperience = { ...req.body, id: newId };
    data.experience.unshift(newExperience);
    await fs.writeJson(PORTFOLIO_FILE, data, { spaces: 2 });
    res.json({ success: true, data: newExperience });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

// Update experience
router.put('/api/portfolio/experience/:id', requireAuth, async (req, res) => {
  try {
    const data = await fs.readJson(PORTFOLIO_FILE);
    const expIndex = data.experience.findIndex(exp => exp.id === parseInt(req.params.id));
    
    if (expIndex === -1) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    data.experience[expIndex] = { ...data.experience[expIndex], ...req.body };
    await fs.writeJson(PORTFOLIO_FILE, data, { spaces: 2 });
    res.json({ success: true, data: data.experience[expIndex] });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

// Delete experience
router.delete('/api/portfolio/experience/:id', requireAuth, async (req, res) => {
  try {
    const data = await fs.readJson(PORTFOLIO_FILE);
    const initialLength = data.experience.length;
    data.experience = data.experience.filter(exp => exp.id !== parseInt(req.params.id));
    
    if (data.experience.length === initialLength) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    await fs.writeJson(PORTFOLIO_FILE, data, { spaces: 2 });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// Update skills
router.put('/api/portfolio/skills', requireAuth, async (req, res) => {
  try {
    const data = await fs.readJson(PORTFOLIO_FILE);
    data.skills = req.body.skills || [];
    await fs.writeJson(PORTFOLIO_FILE, data, { spaces: 2 });
    res.json({ success: true, data: data.skills });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ error: 'Failed to update skills' });
  }
});

// Update achievements
router.put('/api/portfolio/achievements', requireAuth, async (req, res) => {
  try {
    // Read current data with validation
    let data;
    try {
      const fileContent = await fs.readFile(PORTFOLIO_FILE, 'utf8');
      if (!fileContent.trim()) {
        throw new Error('Empty file');
      }
      data = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('JSON parse error in achievements update:', parseError);
      // Try to restore from backup or create default structure
      data = await restoreOrCreateDefaultData();
    }
    
    // Validate and update achievements
    if (!data.achievements) {
      data.achievements = {};
    }
    
    data.achievements = { ...data.achievements, ...req.body };
    
    // Write with validation
    await writePortfolioFileSecurely(data);
    
    res.json({ success: true, data: data.achievements });
  } catch (error) {
    console.error('Error updating achievements:', error);
    res.status(500).json({ error: 'Failed to update achievements' });
  }
});

// Update entire portfolio (comprehensive update)
router.put('/api/portfolio', requireAuth, async (req, res) => {
  try {
    // Read current data with validation
    let currentData;
    try {
      const fileContent = await fs.readFile(PORTFOLIO_FILE, 'utf8');
      if (!fileContent.trim()) {
        throw new Error('Empty file');
      }
      currentData = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('JSON parse error in portfolio update:', parseError);
      currentData = await restoreOrCreateDefaultData();
    }
    
    const updatedData = { ...currentData, ...req.body };
    
    // Ensure experience items have proper IDs
    if (updatedData.experience) {
      updatedData.experience = updatedData.experience.map((exp, index) => ({
        ...exp,
        id: exp.id || index + 1
      }));
    }
    
    // Write securely
    await writePortfolioFileSecurely(updatedData);
    
    // Trigger live reload for all connected clients
    if (global.broadcastReload) {
      global.broadcastReload();
      console.log('📢 Broadcasting reload to all connected clients');
    }
    
    res.json({ 
      success: true, 
      message: 'Portfolio updated successfully!',
      data: updatedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

// Publish changes (triggers website refresh)
router.post('/api/portfolio/publish', requireAuth, async (req, res) => {
  try {
    // Trigger live reload for all connected clients
    if (global.broadcastReload) {
      global.broadcastReload();
      console.log('📢 Broadcasting reload to all connected clients');
    }
    
    res.json({ 
      success: true, 
      message: 'Changes published successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error publishing changes:', error);
    res.status(500).json({ error: 'Failed to publish changes' });
  }
});

// Dashboard page - serve the new comprehensive admin dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/admin-v2.html'));
});

// ========================================
// UTILITY FUNCTIONS FOR FILE SAFETY
// ========================================

async function restoreOrCreateDefaultData() {
  console.log('⚠️ Attempting to restore or create default portfolio data');
  
  const defaultData = {
    "profile": {
      "name": "Your Name",
      "title": "Your Professional Title",
      "description": "Your professional description",
      "email": "your.email@example.com",
      "phone": "+1234567890",
      "location": "Your Location",
      "website": ""
    },
    "about": {
      "summary": "Your professional summary",
      "description": "Your detailed description",
      "education": {
        "degree": "Your Degree",
        "institution": "Your University",
        "years": "Year - Year",
        "description": "Education description"
      },
      "certifications": []
    },
    "experience": [],
    "skills": [],
    "achievements": {
      "customerSatisfaction": "0%",
      "operationalEfficiency": "0%",
      "experience": "0+"
    }
  };
  
  try {
    // Try to read from backup if it exists
    const backupFile = PORTFOLIO_FILE + '.backup';
    if (await fs.pathExists(backupFile)) {
      console.log('⚙️ Restoring from backup file');
      const backupData = await fs.readJson(backupFile);
      await writePortfolioFileSecurely(backupData);
      return backupData;
    }
  } catch (backupError) {
    console.warn('⚠️ Could not restore from backup:', backupError.message);
  }
  
  // Use default data as last resort
  console.log('ℹ️ Using default data structure');
  await writePortfolioFileSecurely(defaultData);
  return defaultData;
}

async function writePortfolioFileSecurely(data) {
  const tempFile = PORTFOLIO_FILE + '.tmp.' + Date.now();
  const backupFile = PORTFOLIO_FILE + '.backup';
  
  try {
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure');
    }
    
    // Ensure required fields exist
    if (!data.profile) data.profile = {};
    if (!data.about) data.about = {};
    if (!data.experience) data.experience = [];
    if (!data.skills) data.skills = [];
    if (!data.achievements) data.achievements = {};
    
    // Clean up any existing temp files
    const existingTempFiles = await fs.readdir(path.dirname(PORTFOLIO_FILE))
      .then(files => files.filter(f => f.includes('.tmp.')))
      .catch(() => []);
    
    for (const tempFile of existingTempFiles) {
      try {
        await fs.unlink(path.join(path.dirname(PORTFOLIO_FILE), tempFile));
      } catch (e) { /* ignore cleanup errors */ }
    }
    
    // Create backup before writing (remove existing backup first)
    if (await fs.pathExists(PORTFOLIO_FILE)) {
      try {
        if (await fs.pathExists(backupFile)) {
          await fs.unlink(backupFile);
        }
        await fs.copy(PORTFOLIO_FILE, backupFile);
      } catch (backupError) {
        console.warn('⚠️ Backup creation failed:', backupError.message);
        // Continue without backup - better to save than fail
      }
    }
    
    // Test JSON serialization
    const jsonString = JSON.stringify(data, null, 2);
    
    // Write to unique temporary file first
    await fs.writeFile(tempFile, jsonString, 'utf8');
    
    // Validate the written file can be parsed
    const testContent = await fs.readFile(tempFile, 'utf8');
    JSON.parse(testContent); // This will throw if invalid
    
    // If validation passes, replace the original file
    if (await fs.pathExists(PORTFOLIO_FILE)) {
      await fs.unlink(PORTFOLIO_FILE);
    }
    await fs.move(tempFile, PORTFOLIO_FILE);
    
    console.log('✅ Portfolio file written successfully');
  } catch (error) {
    console.error('❌ Error writing portfolio file securely:', error);
    
    // Clean up temp file if it exists
    try {
      if (await fs.pathExists(tempFile)) {
        await fs.unlink(tempFile);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Temp file cleanup failed:', cleanupError.message);
    }
    
    throw error;
  }
}

module.exports = router;
