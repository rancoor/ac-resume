#!/usr/bin/env node

/**
 * Portfolio JSON Validation and Repair Utility
 * This script validates and repairs the portfolio.json file
 */

const fs = require('fs-extra');
const path = require('path');

const PORTFOLIO_FILE = path.join(__dirname, '../data/portfolio.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

async function main() {
    console.log('🔍 Portfolio JSON Validation and Repair Utility');
    console.log('================================================');
    
    try {
        // Ensure backup directory exists
        await fs.ensureDir(BACKUP_DIR);
        
        // Check if portfolio file exists
        if (!await fs.pathExists(PORTFOLIO_FILE)) {
            console.log('❌ Portfolio file does not exist. Creating default...');
            await createDefaultPortfolio();
            return;
        }
        
        // Read and validate the file
        console.log('📖 Reading portfolio.json...');
        const fileContent = await fs.readFile(PORTFOLIO_FILE, 'utf8');
        
        if (!fileContent.trim()) {
            console.log('❌ Portfolio file is empty. Creating default...');
            await createDefaultPortfolio();
            return;
        }
        
        try {
            const data = JSON.parse(fileContent);
            console.log('✅ JSON is valid');
            
            // Validate structure
            const validationResult = validateStructure(data);
            if (validationResult.isValid) {
                console.log('✅ Structure is valid');
                console.log(`📊 Profile: ${data.profile?.name || 'Not set'}`);
                console.log(`📝 Experience items: ${data.experience?.length || 0}`);
                console.log(`🛠️ Skills: ${data.skills?.length || 0}`);
            } else {
                console.log('⚠️ Structure issues found:');
                validationResult.errors.forEach(error => console.log(`   - ${error}`));
                
                console.log('🔧 Attempting to repair structure...');
                const repairedData = repairStructure(data);
                await backupAndSave(repairedData, 'structure-repair');
                console.log('✅ Structure repaired and saved');
            }
            
        } catch (parseError) {
            console.log('❌ JSON parsing failed:', parseError.message);
            console.log('🔧 Attempting to repair JSON...');
            
            const repairedContent = await repairJSON(fileContent);
            if (repairedContent) {
                await backupAndSave(JSON.parse(repairedContent), 'json-repair');
                console.log('✅ JSON repaired and saved');
            } else {
                console.log('❌ Could not repair JSON. Creating default...');
                await createDefaultPortfolio();
            }
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

function validateStructure(data) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
        errors.push('Data is not an object');
        return { isValid: false, errors };
    }
    
    // Check required top-level fields
    const requiredFields = ['profile', 'about', 'experience', 'skills', 'achievements'];
    for (const field of requiredFields) {
        if (!(field in data)) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    
    // Validate profile
    if (data.profile && typeof data.profile === 'object') {
        const profileFields = ['name', 'title', 'email'];
        for (const field of profileFields) {
            if (!data.profile[field]) {
                errors.push(`Missing profile.${field}`);
            }
        }
    }
    
    // Validate arrays
    if (data.experience && !Array.isArray(data.experience)) {
        errors.push('experience should be an array');
    }
    
    if (data.skills && !Array.isArray(data.skills)) {
        errors.push('skills should be an array');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function repairStructure(data) {
    const repaired = { ...data };
    
    // Ensure all required fields exist
    if (!repaired.profile || typeof repaired.profile !== 'object') {
        repaired.profile = {};
    }
    
    if (!repaired.about || typeof repaired.about !== 'object') {
        repaired.about = {};
    }
    
    if (!Array.isArray(repaired.experience)) {
        repaired.experience = [];
    }
    
    if (!Array.isArray(repaired.skills)) {
        repaired.skills = [];
    }
    
    if (!repaired.achievements || typeof repaired.achievements !== 'object') {
        repaired.achievements = {
            customerSatisfaction: '0%',
            operationalEfficiency: '0%',
            experience: '0+'
        };
    }
    
    // Ensure experience items have IDs
    repaired.experience = repaired.experience.map((exp, index) => ({
        ...exp,
        id: exp.id || index + 1
    }));
    
    // Ensure profile has required fields
    if (!repaired.profile.name) repaired.profile.name = 'Your Name';
    if (!repaired.profile.title) repaired.profile.title = 'Your Title';
    if (!repaired.profile.email) repaired.profile.email = 'your.email@example.com';
    
    return repaired;
}

async function repairJSON(content) {
    console.log('🔧 Attempting JSON repair...');
    
    // Common JSON repair attempts
    const repairAttempts = [
        // Remove trailing commas
        (str) => str.replace(/,(\s*[}\]])/g, '$1'),
        
        // Fix incomplete objects/arrays
        (str) => {
            let fixed = str.trim();
            
            // Count braces and brackets
            const openBraces = (fixed.match(/\{/g) || []).length;
            const closeBraces = (fixed.match(/\}/g) || []).length;
            const openBrackets = (fixed.match(/\[/g) || []).length;
            const closeBrackets = (fixed.match(/\]/g) || []).length;
            
            // Add missing closing braces
            for (let i = 0; i < openBraces - closeBraces; i++) {
                fixed += '}';
            }
            
            // Add missing closing brackets
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
                fixed += ']';
            }
            
            return fixed;
        },
        
        // Remove incomplete last line
        (str) => {
            const lines = str.split('\n');
            if (lines.length > 1) {
                const lastLine = lines[lines.length - 1].trim();
                if (lastLine && !lastLine.endsWith('}') && !lastLine.endsWith(']')) {
                    return lines.slice(0, -1).join('\n');
                }
            }
            return str;
        }
    ];
    
    for (const attempt of repairAttempts) {
        try {
            const repairedContent = attempt(content);
            JSON.parse(repairedContent); // Test if it parses
            console.log('✅ JSON repair successful');
            return repairedContent;
        } catch (error) {
            // Continue to next attempt
        }
    }
    
    console.log('❌ Could not repair JSON automatically');
    return null;
}

async function createDefaultPortfolio() {
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
    
    await backupAndSave(defaultData, 'default-creation');
    console.log('✅ Default portfolio created');
}

async function backupAndSave(data, reason) {
    // Create backup if original exists
    if (await fs.pathExists(PORTFOLIO_FILE)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(BACKUP_DIR, `portfolio-${reason}-${timestamp}.json`);
        await fs.copy(PORTFOLIO_FILE, backupFile);
        console.log(`💾 Backup created: ${path.basename(backupFile)}`);
    }
    
    // Write new data
    const jsonString = JSON.stringify(data, null, 2);
    
    // Write to temporary file first
    const tempFile = PORTFOLIO_FILE + '.tmp';
    await fs.writeFile(tempFile, jsonString, 'utf8');
    
    // Validate the written file
    const testContent = await fs.readFile(tempFile, 'utf8');
    JSON.parse(testContent); // This will throw if invalid
    
    // Move temp file to actual file
    await fs.move(tempFile, PORTFOLIO_FILE);
    
    console.log('💾 Portfolio file saved successfully');
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    validateStructure,
    repairStructure,
    repairJSON,
    createDefaultPortfolio
};