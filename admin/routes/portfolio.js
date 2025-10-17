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
    const data = await fs.readJson(PORTFOLIO_FILE);
    data.achievements = { ...data.achievements, ...req.body };
    await fs.writeJson(PORTFOLIO_FILE, data, { spaces: 2 });
    res.json({ success: true, data: data.achievements });
  } catch (error) {
    console.error('Error updating achievements:', error);
    res.status(500).json({ error: 'Failed to update achievements' });
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

// Dashboard page
router.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

module.exports = router;
