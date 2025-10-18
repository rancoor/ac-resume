#!/usr/bin/env node

/**
 * Dashboard Health Check Script
 * Comprehensive validation of all dashboard functionality
 */

const fs = require('fs-extra');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log('🏥 Dashboard Health Check');
    console.log('========================');
    
    const results = {
        server: await checkServer(),
        files: await checkFiles(),
        apis: await checkAPIs(),
        database: await checkDatabase(),
        features: await checkFeatures()
    };
    
    // Print summary
    console.log('\n📊 HEALTH CHECK SUMMARY');
    console.log('=======================');
    
    Object.entries(results).forEach(([category, result]) => {
        const status = result.status === 'healthy' ? '✅' : '❌';
        console.log(`${status} ${category.toUpperCase()}: ${result.message}`);
        
        if (result.details && result.details.length > 0) {
            result.details.forEach(detail => {
                console.log(`   • ${detail}`);
            });
        }
    });
    
    // Overall status
    const allHealthy = Object.values(results).every(r => r.status === 'healthy');
    console.log(`\n🎯 OVERALL STATUS: ${allHealthy ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);
    
    if (!allHealthy) {
        console.log('\n🔧 RECOMMENDED ACTIONS:');
        Object.entries(results).forEach(([category, result]) => {
            if (result.status !== 'healthy' && result.recommendations) {
                console.log(`\n${category.toUpperCase()}:`);
                result.recommendations.forEach(rec => console.log(`   • ${rec}`));
            }
        });
    }
}

async function checkServer() {
    try {
        const isRunning = await makeRequest('/');
        if (isRunning) {
            return {
                status: 'healthy',
                message: 'Server is running on port 3000',
                details: ['HTTP server responsive', 'Ready to serve requests']
            };
        } else {
            return {
                status: 'unhealthy',
                message: 'Server not responding',
                recommendations: ['Run: node server.js', 'Check if port 3000 is available']
            };
        }
    } catch (error) {
        return {
            status: 'unhealthy',
            message: 'Server connection failed',
            recommendations: ['Start the server: node server.js', 'Check server logs for errors']
        };
    }
}

async function checkFiles() {
    const requiredFiles = [
        'public/admin.html',
        'public/js/admin-v2.js',
        'public/js/admin-enhanced.js',
        'public/js/dashboard-fixes.js',
        'data/portfolio.json',
        'server.js'
    ];
    
    const missingFiles = [];
    const presentFiles = [];
    
    for (const file of requiredFiles) {
        if (await fs.pathExists(path.join(process.cwd(), file))) {
            presentFiles.push(file);
        } else {
            missingFiles.push(file);
        }
    }
    
    if (missingFiles.length === 0) {
        return {
            status: 'healthy',
            message: `All ${requiredFiles.length} required files present`,
            details: [`${presentFiles.length} files validated`]
        };
    } else {
        return {
            status: 'unhealthy',
            message: `${missingFiles.length} files missing`,
            details: missingFiles.map(f => `Missing: ${f}`),
            recommendations: ['Restore missing files from backup or repository']
        };
    }
}

async function checkAPIs() {
    const endpoints = [
        { path: '/api/portfolio', name: 'Public Portfolio API', auth: false },
        { path: '/admin/api/media', name: 'Media API', auth: true },
        { path: '/admin/api/social', name: 'Social API', auth: true },
        { path: '/admin/api/analytics', name: 'Analytics API', auth: true },
        { path: '/admin/api/integrations', name: 'Integrations API', auth: true }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const response = await makeRequest(endpoint.path);
            if (response) {
                if (endpoint.auth && response.includes('Authentication required')) {
                    results.push(`✅ ${endpoint.name} (Auth protected)`);
                } else if (!endpoint.auth) {
                    results.push(`✅ ${endpoint.name} (Public)`);
                } else {
                    results.push(`⚠️ ${endpoint.name} (Unexpected response)`);
                }
            } else {
                results.push(`❌ ${endpoint.name} (No response)`);
            }
        } catch (error) {
            results.push(`❌ ${endpoint.name} (Error: ${error.message})`);
        }
    }
    
    const healthyCount = results.filter(r => r.startsWith('✅')).length;
    const status = healthyCount === endpoints.length ? 'healthy' : 'unhealthy';
    
    return {
        status,
        message: `${healthyCount}/${endpoints.length} APIs responding`,
        details: results,
        recommendations: status === 'unhealthy' ? ['Check server logs', 'Verify route configurations'] : []
    };
}

async function checkDatabase() {
    try {
        const portfolioPath = path.join(process.cwd(), 'data/portfolio.json');
        
        if (!await fs.pathExists(portfolioPath)) {
            return {
                status: 'unhealthy',
                message: 'Portfolio database missing',
                recommendations: ['Run: node scripts/validate-portfolio.js']
            };
        }
        
        const content = await fs.readFile(portfolioPath, 'utf8');
        const data = JSON.parse(content);
        
        // Validate structure
        const requiredFields = ['profile', 'about', 'experience', 'skills', 'achievements'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length === 0) {
            return {
                status: 'healthy',
                message: 'Portfolio database healthy',
                details: [
                    `Profile: ${data.profile?.name || 'Unnamed'}`,
                    `Experience: ${data.experience?.length || 0} items`,
                    `Skills: ${data.skills?.length || 0} items`,
                    `File size: ${Math.round(content.length / 1024)}KB`
                ]
            };
        } else {
            return {
                status: 'unhealthy',
                message: 'Portfolio structure incomplete',
                details: missingFields.map(f => `Missing: ${f}`),
                recommendations: ['Run: node scripts/validate-portfolio.js']
            };
        }
    } catch (error) {
        return {
            status: 'unhealthy',
            message: 'Database validation failed',
            recommendations: ['Run: node scripts/validate-portfolio.js', 'Check JSON syntax']
        };
    }
}

async function checkFeatures() {
    const features = [];
    
    // Check if enhanced JavaScript exists
    const enhancedJSPath = path.join(process.cwd(), 'public/js/admin-enhanced.js');
    if (await fs.pathExists(enhancedJSPath)) {
        const content = await fs.readFile(enhancedJSPath, 'utf8');
        const hasEnhancedCMS = content.includes('class EnhancedResumeCMS');
        features.push(hasEnhancedCMS ? '✅ Enhanced CMS Class' : '❌ Enhanced CMS Class');
        
        const hasMediaLibrary = content.includes('initializeMediaLibrary');
        features.push(hasMediaLibrary ? '✅ Media Library' : '❌ Media Library');
        
        const hasSocialMedia = content.includes('initializeSocialMedia');
        features.push(hasSocialMedia ? '✅ Social Media Integration' : '❌ Social Media Integration');
        
        const hasAnalytics = content.includes('initializeAnalytics');
        features.push(hasAnalytics ? '✅ Analytics Dashboard' : '❌ Analytics Dashboard');
    } else {
        features.push('❌ Enhanced JavaScript Missing');
    }
    
    // Check if dashboard fixes exist
    const fixesPath = path.join(process.cwd(), 'public/js/dashboard-fixes.js');
    if (await fs.pathExists(fixesPath)) {
        features.push('✅ Dashboard Fixes');
    } else {
        features.push('❌ Dashboard Fixes');
    }
    
    const healthyFeatures = features.filter(f => f.startsWith('✅')).length;
    const status = healthyFeatures >= features.length * 0.8 ? 'healthy' : 'unhealthy';
    
    return {
        status,
        message: `${healthyFeatures}/${features.length} features available`,
        details: features,
        recommendations: status === 'unhealthy' ? ['Restore missing JavaScript files'] : []
    };
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.setTimeout(5000);
        req.end();
    });
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Health check failed:', error);
        process.exit(1);
    });
}

module.exports = { main };