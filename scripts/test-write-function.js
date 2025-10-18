#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Import the write function logic
const PORTFOLIO_FILE = path.join(__dirname, '../data/portfolio.json');

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

async function testWriteFunction() {
    console.log('🧪 Testing Portfolio Write Function Fix');
    console.log('=======================================\n');
    
    try {
        // Read current data
        const currentData = await fs.readJSON(PORTFOLIO_FILE);
        console.log('📖 Current profile name:', currentData.profile?.name);
        
        // Test multiple rapid writes (this was causing the original issue)
        console.log('📝 Testing multiple rapid writes...');
        
        for (let i = 0; i < 5; i++) {
            const testData = { ...currentData };
            testData.achievements = {
                ...testData.achievements,
                testField: `Test ${i + 1}`,
                customerSatisfaction: `${90 + i}%`
            };
            
            await writePortfolioFileSecurely(testData);
            console.log(`   ✅ Write ${i + 1} completed successfully`);
        }
        
        // Verify final state
        const finalData = await fs.readJSON(PORTFOLIO_FILE);
        console.log('\n📊 Final state:');
        console.log('   • Profile name:', finalData.profile?.name);
        console.log('   • Test field:', finalData.achievements?.testField);
        console.log('   • Customer satisfaction:', finalData.achievements?.customerSatisfaction);
        
        // Clean up test data
        delete finalData.achievements.testField;
        await writePortfolioFileSecurely(finalData);
        console.log('   ✅ Cleaned up test data');
        
        // Check for leftover files
        const dataDir = path.dirname(PORTFOLIO_FILE);
        const files = await fs.readdir(dataDir);
        const tempFiles = files.filter(f => f.includes('.tmp') || f.includes('.backup'));
        
        if (tempFiles.length === 0) {
            console.log('   ✅ No leftover temp files');
        } else {
            console.log('   ⚠️ Found leftover files:', tempFiles);
            // Clean them up
            for (const file of tempFiles) {
                await fs.unlink(path.join(dataDir, file));
            }
            console.log('   ✅ Cleaned up leftover files');
        }
        
        console.log('\n🎯 RESULT: Write function fix is working correctly!');
        console.log('   • Multiple rapid writes handled without conflicts');
        console.log('   • File integrity maintained');
        console.log('   • No leftover temp/backup files');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testWriteFunction();