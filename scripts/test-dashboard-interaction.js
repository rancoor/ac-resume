#!/usr/bin/env node

/**
 * Interactive Dashboard Test Script
 * Tests actual user interactions and API calls
 */

const readline = require('readline');
const http = require('http');
const path = require('path');
const fs = require('fs-extra');

const BASE_URL = 'http://localhost:3000';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log('🧪 Interactive Dashboard Test Suite');
    console.log('====================================\n');
    
    try {
        // Test 1: Server availability
        console.log('1️⃣ Testing server availability...');
        const serverResponse = await makeRequest('GET', '/api/portfolio');
        if (serverResponse) {
            const data = JSON.parse(serverResponse);
            console.log(`✅ Server running - Profile: ${data.profile?.name || 'Unknown'}\n`);
        } else {
            console.log('❌ Server not responding\n');
            return;
        }
        
        // Test 2: Admin dashboard loading
        console.log('2️⃣ Testing admin dashboard page...');
        const dashboardHTML = await makeRequest('GET', '/admin/dashboard');
        if (dashboardHTML.includes('Media Library') && dashboardHTML.includes('Analytics')) {
            console.log('✅ Admin dashboard contains enhanced features\n');
        } else {
            console.log('⚠️ Admin dashboard missing some enhanced features\n');
        }
        
        // Test 3: Authentication-protected APIs
        console.log('3️⃣ Testing API authentication...');
        const protectedApis = ['/admin/api/media', '/admin/api/social', '/admin/api/analytics', '/admin/api/integrations'];
        
        for (const api of protectedApis) {
            try {
                const response = await makeRequest('GET', api);
                if (response.includes('Authentication required')) {
                    console.log(`✅ ${api} - Properly protected`);
                } else {
                    console.log(`⚠️ ${api} - Unexpected response: ${response.substring(0, 50)}...`);
                }
            } catch (error) {
                console.log(`❌ ${api} - Error: ${error.message}`);
            }
        }
        
        console.log('\n4️⃣ Testing portfolio data update...');
        
        // Test 4: Portfolio update simulation
        const testData = {
            profile: {
                name: "Amos Cheruiyot (Test Update)",
                title: "Full Stack Developer & Software Engineer",
                email: "test@example.com",
                phone: "+1234567890",
                location: "Test Location",
                website: "https://test.example.com"
            }
        };
        
        try {
            const updateResponse = await makeRequest('PUT', '/admin/api/portfolio', JSON.stringify(testData));
            if (updateResponse.includes('Authentication required')) {
                console.log('✅ Portfolio update endpoint properly protected');
            } else {
                console.log('⚠️ Portfolio update endpoint response:', updateResponse.substring(0, 100));
            }
        } catch (error) {
            console.log('❌ Portfolio update test failed:', error.message);
        }
        
        // Interactive test menu
        console.log('\n🔧 Interactive Test Menu');
        console.log('========================');
        console.log('1. Test file upload simulation');
        console.log('2. Test portfolio backup/restore');
        console.log('3. Validate JSON data integrity');
        console.log('4. Generate test report');
        console.log('5. Exit');
        
        await showInteractiveMenu();
        
    } catch (error) {
        console.error('Test suite failed:', error);
    } finally {
        rl.close();
    }
}

async function showInteractiveMenu() {
    return new Promise((resolve) => {
        rl.question('\nSelect a test option (1-5): ', async (answer) => {
            switch (answer.trim()) {
                case '1':
                    await testFileUpload();
                    break;
                case '2':
                    await testBackupRestore();
                    break;
                case '3':
                    await validateJSONIntegrity();
                    break;
                case '4':
                    await generateTestReport();
                    break;
                case '5':
                    console.log('Exiting test suite...');
                    resolve();
                    return;
                default:
                    console.log('Invalid option. Please select 1-5.');
            }
            await showInteractiveMenu();
            resolve();
        });
    });
}

async function testFileUpload() {
    console.log('\n📁 File Upload Test');
    console.log('===================');
    
    // Simulate media API call
    try {
        const response = await makeRequest('POST', '/admin/api/media', JSON.stringify({
            action: 'test',
            fileName: 'test-image.jpg',
            fileSize: 1024
        }));
        
        if (response.includes('Authentication required')) {
            console.log('✅ File upload endpoint properly protected');
        } else {
            console.log('⚠️ Unexpected response from media API');
        }
    } catch (error) {
        console.log('❌ Media API test failed:', error.message);
    }
}

async function testBackupRestore() {
    console.log('\n💾 Backup & Restore Test');
    console.log('========================');
    
    const portfolioPath = path.join(process.cwd(), 'data/portfolio.json');
    const backupPath = path.join(process.cwd(), 'data/portfolio-test-backup.json');
    
    try {
        // Create backup
        if (await fs.pathExists(portfolioPath)) {
            await fs.copy(portfolioPath, backupPath);
            console.log('✅ Test backup created successfully');
            
            // Verify backup
            const originalSize = (await fs.stat(portfolioPath)).size;
            const backupSize = (await fs.stat(backupPath)).size;
            
            if (originalSize === backupSize) {
                console.log('✅ Backup integrity verified');
                
                // Clean up test backup
                await fs.remove(backupPath);
                console.log('✅ Test backup cleaned up');
            } else {
                console.log('❌ Backup size mismatch');
            }
        } else {
            console.log('❌ Portfolio file not found');
        }
    } catch (error) {
        console.log('❌ Backup test failed:', error.message);
    }
}

async function validateJSONIntegrity() {
    console.log('\n🔍 JSON Data Integrity Test');
    console.log('===========================');
    
    try {
        const portfolioPath = path.join(process.cwd(), 'data/portfolio.json');
        const content = await fs.readFile(portfolioPath, 'utf8');
        const data = JSON.parse(content);
        
        // Validate structure
        const requiredFields = ['profile', 'about', 'experience', 'skills', 'achievements'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length === 0) {
            console.log('✅ JSON structure is valid');
            console.log(`   • Profile name: ${data.profile?.name || 'Not set'}`);
            console.log(`   • Experience entries: ${data.experience?.length || 0}`);
            console.log(`   • Skills entries: ${data.skills?.length || 0}`);
        } else {
            console.log('❌ JSON structure incomplete');
            console.log('   Missing fields:', missingFields.join(', '));
        }
        
        // Check for common issues
        const jsonString = JSON.stringify(data, null, 2);
        if (jsonString.includes('undefined') || jsonString.includes('null')) {
            console.log('⚠️ Found null/undefined values in data');
        } else {
            console.log('✅ No null/undefined values detected');
        }
        
    } catch (error) {
        console.log('❌ JSON validation failed:', error.message);
    }
}

async function generateTestReport() {
    console.log('\n📊 Generating Test Report');
    console.log('=========================');
    
    const report = {
        timestamp: new Date().toISOString(),
        server_status: 'unknown',
        api_endpoints: {},
        file_integrity: 'unknown',
        features_available: []
    };
    
    try {
        // Check server
        const serverResponse = await makeRequest('GET', '/api/portfolio');
        report.server_status = serverResponse ? 'running' : 'down';
        
        // Check APIs
        const apis = ['/admin/api/media', '/admin/api/social', '/admin/api/analytics'];
        for (const api of apis) {
            try {
                const response = await makeRequest('GET', api);
                report.api_endpoints[api] = response.includes('Authentication required') ? 'protected' : 'unprotected';
            } catch (error) {
                report.api_endpoints[api] = 'error';
            }
        }
        
        // Check files
        const requiredFiles = ['public/admin.html', 'public/js/admin-enhanced.js', 'data/portfolio.json'];
        const missingFiles = [];
        
        for (const file of requiredFiles) {
            if (!await fs.pathExists(path.join(process.cwd(), file))) {
                missingFiles.push(file);
            }
        }
        
        report.file_integrity = missingFiles.length === 0 ? 'complete' : 'incomplete';
        
        // Save report
        const reportPath = path.join(process.cwd(), 'test-report.json');
        await fs.writeJSON(reportPath, report, { spaces: 2 });
        
        console.log('✅ Test report generated:', reportPath);
        console.log('\nReport Summary:');
        console.log(`   • Server Status: ${report.server_status}`);
        console.log(`   • File Integrity: ${report.file_integrity}`);
        console.log(`   • API Endpoints: ${Object.keys(report.api_endpoints).length} tested`);
        
    } catch (error) {
        console.log('❌ Report generation failed:', error.message);
    }
}

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }
        
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
        
        if (body) {
            req.write(body);
        }
        
        req.end();
    });
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Interactive test failed:', error);
        process.exit(1);
    });
}

module.exports = { main };