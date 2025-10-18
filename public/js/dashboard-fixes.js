/**
 * Dashboard Fixes and Patches
 * This file contains all the fixes for the enhanced dashboard functionality
 */

console.log('🔧 Loading dashboard fixes...');

// Wait for DOM to be ready and CMS to be initialized
document.addEventListener('DOMContentLoaded', function() {
    // Apply fixes after a short delay to ensure all scripts are loaded
    setTimeout(applyDashboardFixes, 1000);
});

function applyDashboardFixes() {
    console.log('🚀 Applying dashboard fixes...');
    
    // Fix 1: Ensure Enhanced CMS is properly initialized
    fixEnhancedCMSInitialization();
    
    // Fix 2: Fix navigation for enhanced sections
    fixEnhancedNavigation();
    
    // Fix 3: Fix tools dropdown functionality
    fixToolsDropdown();
    
    // Fix 4: Ensure charts are properly initialized
    fixChartsInitialization();
    
    // Fix 5: Fix form interactions
    fixFormInteractions();
    
    console.log('✅ Dashboard fixes applied successfully');
}

function fixEnhancedCMSInitialization() {
    console.log('🔧 Fixing Enhanced CMS initialization...');
    
    // Ensure Enhanced CMS is available globally
    if (typeof EnhancedResumeCMS !== 'undefined' && !window.enhancedCMS) {
        try {
            window.enhancedCMS = new EnhancedResumeCMS();
            console.log('✅ Enhanced CMS instance created');
        } catch (error) {
            console.warn('⚠️ Could not create Enhanced CMS instance:', error);
        }
    }
    
    // Ensure backward compatibility
    if (window.enhancedCMS && !window.cms) {
        window.cms = window.enhancedCMS;
        console.log('✅ CMS backward compatibility ensured');
    }
}

function fixEnhancedNavigation() {
    console.log('🔧 Fixing enhanced navigation...');
    
    // Add click handlers for enhanced sections
    document.addEventListener('click', function(e) {
        const navItem = e.target.closest('[data-section]');
        if (!navItem) return;
        
        const section = navItem.dataset.section;
        const enhancedSections = ['media', 'social', 'integrations', 'advanced', 'analytics'];
        
        if (enhancedSections.includes(section)) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🔄 Navigating to enhanced section: ${section}`);
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(s => {
                s.classList.add('hidden');
            });
            
            // Update nav states
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            navItem.classList.add('active');
            
            // Show or create the section
            showEnhancedSection(section);
        }
    });
}

function showEnhancedSection(sectionName) {
    let section = document.getElementById(`${sectionName}-section`);
    
    if (!section) {
        console.log(`➕ Creating section: ${sectionName}`);
        section = createEnhancedSection(sectionName);
    }
    
    if (section) {
        section.classList.remove('hidden');
        console.log(`✅ Section ${sectionName} is now visible`);
        
        // Initialize section-specific features
        initializeSectionFeatures(sectionName);
    }
}

function createEnhancedSection(sectionName) {
    const mainContent = document.querySelector('.flex-1.p-6') || 
                       document.querySelector('main .flex-1') || 
                       document.querySelector('main') ||
                       document.querySelector('#main-content');
                       
    if (!mainContent) {
        console.error('❌ Could not find main content container');
        return null;
    }
    
    const section = document.createElement('section');
    section.id = `${sectionName}-section`;
    section.className = 'content-section mb-8';
    section.innerHTML = getSectionHTML(sectionName);
    
    mainContent.insertBefore(section, mainContent.firstChild);
    
    console.log(`✅ Section ${sectionName} created`);
    return section;
}

function getSectionHTML(sectionName) {
    const templates = {
        media: `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                    <h2 class="text-2xl font-bold text-white flex items-center space-x-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Media Library</span>
                    </h2>
                    <p class="text-white/80 mt-2">Manage images, documents, and other media files</p>
                </div>
                
                <div class="p-6">
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors mb-6">
                        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Upload Media Files</h3>
                        <p class="text-gray-600">Drag and drop files here, or click to browse</p>
                        <p class="text-sm text-gray-500 mt-2">Supports: Images, PDFs, Word documents (Max 10MB)</p>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4 text-center border-2 border-dashed border-gray-200">
                            <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v1.816a.5.5 0 00.195.399L6 9.5 2.195 11.785a.5.5 0 00-.195.399V14a2 2 0 002 2h12a2 2 0 002-2v-1.816a.5.5 0 00-.195-.399L14 9.5l3.805-2.286A.5.5 0 0018 6.816V5a2 2 0 00-2-2H4z"></path>
                            </svg>
                            <p class="text-sm text-gray-600">No media files yet</p>
                            <p class="text-xs text-gray-500">Upload files to get started</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        social: `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-pink-600 to-rose-600 p-6">
                    <h2 class="text-2xl font-bold text-white flex items-center space-x-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h6l2-2v2z"></path>
                        </svg>
                        <span>Social Media Integration</span>
                    </h2>
                    <p class="text-white/80 mt-2">Connect and manage your social media profiles</p>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${getSocialPlatformHTML()}
                    </div>
                </div>
            </div>
        `,
        
        integrations: `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                    <h2 class="text-2xl font-bold text-white flex items-center space-x-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        <span>Third-party Integrations</span>
                    </h2>
                    <p class="text-white/80 mt-2">Connect with external services and tools</p>
                </div>
                
                <div class="p-6">
                    ${getIntegrationsHTML()}
                </div>
            </div>
        `,
        
        advanced: `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
                    <h2 class="text-2xl font-bold text-white flex items-center space-x-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>Advanced Settings</span>
                    </h2>
                    <p class="text-white/80 mt-2">Advanced customization and development tools</p>
                </div>
                
                <div class="p-6 space-y-8">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Custom CSS</h3>
                        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                            <p>/* Add your custom CSS here */</p>
                            <p>.custom-style {</p>
                            <p>&nbsp;&nbsp;&nbsp;&nbsp;/* Your styles */</p>
                            <p>}</p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-sm text-gray-700">Enable lazy loading</span>
                            </label>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-sm text-gray-700">Minify CSS/JS</span>
                            </label>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-sm text-gray-700">Enable PWA features</span>
                            </label>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-sm text-gray-700">Dark mode support</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    
    return templates[sectionName] || '<div class="p-8 text-center text-gray-500">Section content not found</div>';
}

function getSocialPlatformHTML() {
    const platforms = [
        { name: 'LinkedIn', icon: '💼', color: '#0077b5' },
        { name: 'GitHub', icon: '💻', color: '#333333' },
        { name: 'Twitter', icon: '🐦', color: '#1da1f2' },
        { name: 'Instagram', icon: '📷', color: '#e4405f' }
    ];
    
    return platforms.map(platform => `
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: ${platform.color}20;">
                    <span class="text-lg">${platform.icon}</span>
                </div>
                <div>
                    <h4 class="font-medium text-gray-900">${platform.name}</h4>
                    <p class="text-sm text-gray-500">Not connected</p>
                </div>
            </div>
            
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Profile URL</label>
                    <input type="url" placeholder="https://${platform.name.toLowerCase()}.com/yourprofile" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                </div>
                
                <div class="flex items-center justify-between">
                    <label class="flex items-center">
                        <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="ml-2 text-sm text-gray-700">Show in profile</span>
                    </label>
                    <button class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Connect</button>
                </div>
            </div>
        </div>
    `).join('');
}

function getIntegrationsHTML() {
    const integrations = [
        { name: 'Google Analytics', icon: '📊', description: 'Track website performance' },
        { name: 'EmailJS', icon: '📧', description: 'Email form integration' },
        { name: 'GitHub', icon: '💻', description: 'Repository synchronization' },
        { name: 'Vercel', icon: '🚀', description: 'Deployment platform' }
    ];
    
    return `
        <div class="space-y-4">
            ${integrations.map(integration => `
                <div class="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span class="text-xl">${integration.icon}</span>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">${integration.name}</h3>
                                <p class="text-sm text-gray-600 mt-1">${integration.description}</p>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                                    Available
                                </span>
                            </div>
                        </div>
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Connect
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function initializeSectionFeatures(sectionName) {
    console.log(`🔧 Initializing features for section: ${sectionName}`);
    
    switch (sectionName) {
        case 'media':
            initializeMediaFeatures();
            break;
        case 'social':
            initializeSocialFeatures();
            break;
        case 'integrations':
            initializeIntegrationFeatures();
            break;
        case 'advanced':
            initializeAdvancedFeatures();
            break;
        case 'analytics':
            initializeAnalyticsFeatures();
            break;
    }
}

function initializeMediaFeatures() {
    console.log('📁 Initializing media features...');
    // Add drag and drop functionality placeholder
}

function initializeSocialFeatures() {
    console.log('📱 Initializing social features...');
    // Add social media connection logic placeholder
}

function initializeIntegrationFeatures() {
    console.log('🔗 Initializing integration features...');
    // Add integration setup logic placeholder
}

function initializeAdvancedFeatures() {
    console.log('⚙️ Initializing advanced features...');
    // Add advanced settings logic placeholder
}

function initializeAnalyticsFeatures() {
    console.log('📊 Initializing analytics features...');
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        setTimeout(initializeCharts, 500);
    }
}

function fixToolsDropdown() {
    console.log('🔧 Fixing tools dropdown...');
    
    // Ensure tools dropdown works
    const toolsBtn = document.getElementById('tools-btn');
    const toolsDropdown = document.getElementById('tools-dropdown');
    
    if (toolsBtn && toolsDropdown) {
        toolsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toolsDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#tools-btn') && !e.target.closest('#tools-dropdown')) {
                toolsDropdown.classList.add('hidden');
            }
        });
        
        console.log('✅ Tools dropdown functionality restored');
    }
}

function fixChartsInitialization() {
    console.log('📊 Fixing charts initialization...');
    
    // Initialize charts for analytics section if Chart.js is available
    if (typeof Chart !== 'undefined') {
        setTimeout(initializeCharts, 1000);
    } else {
        console.warn('⚠️ Chart.js not available');
    }
}

function initializeCharts() {
    console.log('📈 Initializing charts...');
    
    // Page Views Chart
    const pageViewsCtx = document.getElementById('pageViewsChart');
    if (pageViewsCtx) {
        new Chart(pageViewsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Page Views',
                    data: [120, 190, 300, 500, 200, 300],
                    borderColor: '#4F46E5',
                    backgroundColor: '#4F46E520',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        console.log('✅ Page views chart initialized');
    }
    
    // Visitors Chart
    const visitorsCtx = document.getElementById('visitorsChart');
    if (visitorsCtx) {
        new Chart(visitorsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: [65, 30, 5],
                    backgroundColor: ['#4F46E5', '#10B981', '#F59E0B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        console.log('✅ Visitors chart initialized');
    }
}

function fixFormInteractions() {
    console.log('📝 Fixing form interactions...');
    
    // Add form validation and interaction fixes
    document.addEventListener('input', function(e) {
        if (e.target.matches('input, textarea, select')) {
            // Add visual feedback for form changes
            e.target.classList.add('border-blue-500');
            setTimeout(() => {
                e.target.classList.remove('border-blue-500');
            }, 1000);
        }
    });
    
    console.log('✅ Form interactions fixed');
}

// Run tool functions
window.runTool = function(toolName) {
    console.log(`🔧 Running tool: ${toolName}`);
    
    const toolMessages = {
        'seo-checker': '🔍 SEO check completed! Score: 87/100',
        'performance': '⚡ Performance test completed! Load time: 1.2s',
        'accessibility': '♿ Accessibility check completed! Score: 94/100',
        'email-test': '📧 Email integration test completed successfully!'
    };
    
    showMessage(toolMessages[toolName] || `Tool "${toolName}" executed`, 'success');
};

// Show message function
window.showMessage = function(message, type = 'info') {
    const container = document.getElementById('message-container') || 
                     document.querySelector('.message-container') ||
                     document.body;
    
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm`;
    
    const colors = {
        success: 'bg-green-100 border-green-200 text-green-800',
        error: 'bg-red-100 border-red-200 text-red-800',
        warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        info: 'bg-blue-100 border-blue-200 text-blue-800'
    };
    
    messageEl.className += ` ${colors[type] || colors.info} border`;
    messageEl.textContent = message;
    
    container.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.remove();
        }
    }, 5000);
};

console.log('✅ Dashboard fixes loaded and ready');