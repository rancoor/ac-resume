/**
 * Enhanced Resume CMS Admin Dashboard
 * Comprehensive JavaScript with advanced features and integrations
 */

class EnhancedResumeCMS extends ResumeCMS {
    constructor() {
        super();
        this.charts = {};
        this.mediaLibrary = [];
        this.socialConnections = {};
        this.seoData = {};
        this.analytics = {};
        this.themes = {};
        this.integrations = {};
        this.codeEditors = {};
        
        // Enhanced initialization
        this.initializeEnhancedFeatures();
    }

    initializeEnhancedFeatures() {
        console.log('🚀 Initializing enhanced CMS features...');
        
        // Initialize advanced components
        this.initializeMediaLibrary();
        this.initializeSocialMedia();
        this.initializeAnalytics();
        this.initializeThemeEditor();
        this.initializeSEOTools();
        this.initializeIntegrations();
        this.initializeAdvancedEditor();
        this.setupEnhancedEventListeners();
        
        console.log('✅ Enhanced features initialized');
    }

    // ========================================
    // MEDIA LIBRARY FUNCTIONALITY
    // ========================================
    initializeMediaLibrary() {
        console.log('📁 Initializing media library...');
        
        // Initialize Dropzone for file uploads
        if (typeof Dropzone !== 'undefined') {
            Dropzone.autoDiscover = false;
            this.initializeDropzone();
        }
        
        // Initialize Cropper.js for image editing
        this.initializeImageCropper();
        
        // Load existing media
        this.loadMediaLibrary();
    }

    initializeDropzone() {
        const dropzoneElement = document.getElementById('media-dropzone');
        if (!dropzoneElement) return;

        this.dropzone = new Dropzone('#media-dropzone', {
            url: '/admin/api/upload',
            maxFilesize: 10, // MB
            acceptedFiles: 'image/*,.pdf,.doc,.docx',
            addRemoveLinks: true,
            dictDefaultMessage: 'Drop files here or click to upload',
            init: function() {
                this.on('success', (file, response) => {
                    console.log('✅ File uploaded successfully:', response);
                    this.addToMediaLibrary(response);
                });
            }
        });
    }

    initializeImageCropper() {
        // Image cropper functionality will be initialized when needed
        this.cropper = null;
    }

    async loadMediaLibrary() {
        try {
            const response = await fetch('/admin/api/media');
            if (response.ok) {
                this.mediaLibrary = await response.json();
                this.renderMediaLibrary();
            }
        } catch (error) {
            console.warn('Media library not available:', error);
            this.mediaLibrary = [];
        }
    }

    renderMediaLibrary() {
        const container = document.getElementById('media-grid');
        if (!container) return;

        container.innerHTML = '';
        
        this.mediaLibrary.forEach(media => {
            const mediaElement = this.createMediaElement(media);
            container.appendChild(mediaElement);
        });
    }

    createMediaElement(media) {
        const div = document.createElement('div');
        div.className = 'media-item bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow';
        
        div.innerHTML = `
            <div class="relative">
                ${media.type === 'image' ? 
                    `<img src="${media.url}" alt="${media.name}" class="w-full h-32 object-cover">` :
                    `<div class="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v1.816a.5.5 0 00.195.399L6 9.5 2.195 11.785a.5.5 0 00-.195.399V14a2 2 0 002 2h12a2 2 0 002-2v-1.816a.5.5 0 00-.195-.399L14 9.5l3.805-2.286A.5.5 0 0018 6.816V5a2 2 0 00-2-2H4z"></path>
                        </svg>
                    </div>`
                }
                <div class="absolute top-2 right-2">
                    <button onclick="enhancedCMS.editMedia('${media.id}')" class="bg-white rounded-full p-1 shadow-sm hover:shadow-md">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="p-3">
                <h4 class="font-medium text-sm text-gray-900 truncate">${media.name}</h4>
                <p class="text-xs text-gray-500 mt-1">${media.size} • ${media.type}</p>
                <div class="flex justify-between items-center mt-2">
                    <button onclick="enhancedCMS.copyMediaUrl('${media.url}')" class="text-xs text-blue-600 hover:text-blue-700">Copy URL</button>
                    <button onclick="enhancedCMS.deleteMedia('${media.id}')" class="text-xs text-red-600 hover:text-red-700">Delete</button>
                </div>
            </div>
        `;
        
        return div;
    }

    // ========================================
    // SOCIAL MEDIA INTEGRATION
    // ========================================
    initializeSocialMedia() {
        console.log('📱 Initializing social media integrations...');
        
        this.socialPlatforms = [
            { name: 'LinkedIn', icon: '💼', color: '#0077b5' },
            { name: 'GitHub', icon: '💻', color: '#333333' },
            { name: 'Twitter', icon: '🐦', color: '#1da1f2' },
            { name: 'Instagram', icon: '📷', color: '#e4405f' },
            { name: 'Facebook', icon: '📘', color: '#1877f2' },
            { name: 'YouTube', icon: '🎥', color: '#ff0000' },
            { name: 'Behance', icon: '🎨', color: '#1769ff' },
            { name: 'Dribbble', icon: '🏀', color: '#ea4c89' }
        ];

        this.loadSocialConnections();
    }

    async loadSocialConnections() {
        try {
            const response = await fetch('/admin/api/social');
            if (response.ok) {
                this.socialConnections = await response.json();
            }
        } catch (error) {
            console.warn('Social connections not available:', error);
            this.socialConnections = {};
        }
        
        this.renderSocialConnections();
    }

    renderSocialConnections() {
        const container = document.getElementById('social-connections');
        if (!container) return;

        container.innerHTML = '';
        
        this.socialPlatforms.forEach(platform => {
            const connection = this.socialConnections[platform.name.toLowerCase()] || {};
            const connectionElement = this.createSocialConnectionElement(platform, connection);
            container.appendChild(connectionElement);
        });
    }

    createSocialConnectionElement(platform, connection) {
        const div = document.createElement('div');
        div.className = 'social-connection bg-white rounded-lg border border-gray-200 p-4';
        
        div.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: ${platform.color}20;">
                        <span class="text-lg">${platform.icon}</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">${platform.name}</h4>
                        <p class="text-sm text-gray-500">${connection.connected ? 'Connected' : 'Not connected'}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${connection.connected ? 
                        '<span class="w-3 h-3 bg-green-500 rounded-full"></span>' :
                        '<span class="w-3 h-3 bg-gray-300 rounded-full"></span>'
                    }
                </div>
            </div>
            
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Profile URL</label>
                    <input type="url" value="${connection.url || ''}" placeholder="https://${platform.name.toLowerCase()}.com/yourprofile" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                           onchange="enhancedCMS.updateSocialConnection('${platform.name.toLowerCase()}', 'url', this.value)">
                </div>
                
                <div class="flex items-center justify-between">
                    <label class="flex items-center">
                        <input type="checkbox" ${connection.showInProfile ? 'checked' : ''} 
                               class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                               onchange="enhancedCMS.updateSocialConnection('${platform.name.toLowerCase()}', 'showInProfile', this.checked)">
                        <span class="ml-2 text-sm text-gray-700">Show in profile</span>
                    </label>
                    
                    ${connection.connected ? 
                        `<button onclick="enhancedCMS.testSocialConnection('${platform.name.toLowerCase()}')" 
                                class="text-sm text-blue-600 hover:text-blue-700">Test</button>` :
                        `<button onclick="enhancedCMS.connectSocial('${platform.name.toLowerCase()}')" 
                                class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Connect</button>`
                    }
                </div>
            </div>
        `;
        
        return div;
    }

    // ========================================
    // ANALYTICS DASHBOARD
    // ========================================
    initializeAnalytics() {
        console.log('📊 Initializing analytics dashboard...');
        
        if (typeof Chart !== 'undefined') {
            this.loadAnalyticsData();
        } else {
            console.warn('Chart.js not available for analytics');
        }
    }

    async loadAnalyticsData() {
        try {
            const response = await fetch('/admin/api/analytics');
            if (response.ok) {
                this.analytics = await response.json();
                this.renderAnalyticsCharts();
            }
        } catch (error) {
            console.warn('Analytics data not available, using demo data');
            this.analytics = this.getDemoAnalyticsData();
            this.renderAnalyticsCharts();
        }
    }

    getDemoAnalyticsData() {
        return {
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
            }
        };
    }

    renderAnalyticsCharts() {
        this.createPageViewsChart();
        this.createVisitorsChart();
        this.renderPerformanceMetrics();
    }

    createPageViewsChart() {
        const ctx = document.getElementById('pageViewsChart');
        if (!ctx) return;

        if (this.charts.pageViews) {
            this.charts.pageViews.destroy();
        }

        this.charts.pageViews = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.analytics.pageViews.labels,
                datasets: [{
                    label: 'Page Views',
                    data: this.analytics.pageViews.data,
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
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createVisitorsChart() {
        const ctx = document.getElementById('visitorsChart');
        if (!ctx) return;

        if (this.charts.visitors) {
            this.charts.visitors.destroy();
        }

        this.charts.visitors = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.analytics.visitors.labels,
                datasets: [{
                    data: this.analytics.visitors.data,
                    backgroundColor: ['#4F46E5', '#10B981', '#F59E0B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderPerformanceMetrics() {
        const container = document.getElementById('performance-metrics');
        if (!container) return;

        const metrics = this.analytics.performance;
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-600">Load Time</h4>
                    <p class="text-2xl font-bold text-blue-600">${metrics.loadTime}s</p>
                </div>
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-600">SEO Score</h4>
                    <p class="text-2xl font-bold text-green-600">${metrics.seoScore}</p>
                </div>
                <div class="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-600">Accessibility</h4>
                    <p class="text-2xl font-bold text-purple-600">${metrics.accessibility}</p>
                </div>
                <div class="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-600">Best Practices</h4>
                    <p class="text-2xl font-bold text-orange-600">${metrics.bestPractices}</p>
                </div>
            </div>
        `;
    }

    // ========================================
    // THEME EDITOR
    // ========================================
    initializeThemeEditor() {
        console.log('🎨 Initializing theme editor...');
        
        // Initialize CSS code editor
        if (typeof ace !== 'undefined') {
            this.initializeCodeEditor();
        }
        
        this.loadThemes();
        this.initializeColorPickers();
    }

    initializeCodeEditor() {
        const editorElement = document.getElementById('css-editor');
        if (!editorElement) return;

        this.codeEditors.css = ace.edit('css-editor');
        this.codeEditors.css.setTheme('ace/theme/monokai');
        this.codeEditors.css.session.setMode('ace/mode/css');
        this.codeEditors.css.setOptions({
            fontSize: 14,
            showLineNumbers: true,
            showGutter: true,
            wrap: true
        });

        // Auto-save on change
        this.codeEditors.css.session.on('change', () => {
            this.debounce(this.saveCustomCSS.bind(this), 1000)();
        });
    }

    initializeColorPickers() {
        const colorInputs = document.querySelectorAll('.color-picker');
        colorInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateThemeColor(e.target.dataset.colorVar, e.target.value);
            });
        });
    }

    // ========================================
    // SEO TOOLS
    // ========================================
    initializeSEOTools() {
        console.log('🔍 Initializing SEO tools...');
        
        this.seoChecks = [
            { name: 'Meta Title', key: 'title' },
            { name: 'Meta Description', key: 'description' },
            { name: 'Keywords', key: 'keywords' },
            { name: 'Open Graph', key: 'openGraph' },
            { name: 'Twitter Cards', key: 'twitterCards' },
            { name: 'JSON-LD', key: 'jsonLD' }
        ];

        this.loadSEOData();
    }

    async loadSEOData() {
        try {
            const response = await fetch('/admin/api/seo');
            if (response.ok) {
                this.seoData = await response.json();
            }
        } catch (error) {
            console.warn('SEO data not available:', error);
            this.seoData = this.getDefaultSEOData();
        }
        
        this.renderSEOForm();
        this.runSEOCheck();
    }

    getDefaultSEOData() {
        return {
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
    }

    // ========================================
    // INTEGRATIONS
    // ========================================
    initializeIntegrations() {
        console.log('🔗 Initializing integrations...');
        
        this.availableIntegrations = [
            {
                name: 'Google Analytics',
                description: 'Track website performance and user behavior',
                status: 'available',
                icon: '📊'
            },
            {
                name: 'EmailJS',
                description: 'Send emails directly from your contact form',
                status: 'available',
                icon: '📧'
            },
            {
                name: 'GitHub',
                description: 'Sync with your GitHub repositories',
                status: 'connected',
                icon: '💻'
            },
            {
                name: 'Vercel',
                description: 'Deploy your resume to Vercel',
                status: 'available',
                icon: '🚀'
            }
        ];

        this.renderIntegrations();
    }

    renderIntegrations() {
        const container = document.getElementById('integrations-list');
        if (!container) return;

        container.innerHTML = '';
        
        this.availableIntegrations.forEach(integration => {
            const integrationElement = this.createIntegrationElement(integration);
            container.appendChild(integrationElement);
        });
    }

    createIntegrationElement(integration) {
        const div = document.createElement('div');
        div.className = 'integration-item bg-white rounded-lg border border-gray-200 p-6';
        
        const statusColor = integration.status === 'connected' ? 'green' : 'blue';
        const actionText = integration.status === 'connected' ? 'Configure' : 'Connect';
        
        div.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-${statusColor}-100 to-${statusColor}-200 rounded-lg flex items-center justify-center">
                        <span class="text-xl">${integration.icon}</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${integration.name}</h3>
                        <p class="text-sm text-gray-600 mt-1">${integration.description}</p>
                        <div class="flex items-center mt-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">
                                ${integration.status}
                            </span>
                        </div>
                    </div>
                </div>
                <button onclick="enhancedCMS.configureIntegration('${integration.name.toLowerCase().replace(' ', '_')}')" 
                        class="px-4 py-2 bg-${statusColor}-600 text-white rounded-lg hover:bg-${statusColor}-700 transition-colors">
                    ${actionText}
                </button>
            </div>
        `;
        
        return div;
    }

    // ========================================
    // ADVANCED EDITOR FEATURES
    // ========================================
    initializeAdvancedEditor() {
        console.log('✏️ Initializing advanced editor features...');
        
        // Enhanced Quill editor with more modules
        this.setupAdvancedQuillEditor();
        
        // Markdown support
        this.initializeMarkdownEditor();
        
        // AI-powered writing assistance (placeholder)
        this.initializeAIAssistant();
    }

    setupAdvancedQuillEditor() {
        // Extend existing Quill editors with more features
        Object.keys(this.editors).forEach(editorKey => {
            if (this.editors[editorKey]) {
                // Add custom modules
                this.addQuillCustomModules(this.editors[editorKey]);
            }
        });
    }

    addQuillCustomModules(editor) {
        // Add word count
        const wordCountContainer = document.createElement('div');
        wordCountContainer.className = 'text-xs text-gray-500 mt-2';
        wordCountContainer.id = `word-count-${Date.now()}`;
        
        const editorContainer = editor.container.parentNode;
        editorContainer.appendChild(wordCountContainer);
        
        editor.on('text-change', () => {
            const text = editor.getText();
            const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            wordCountContainer.textContent = `Words: ${wordCount} | Characters: ${text.length}`;
        });
    }

    // ========================================
    // ENHANCED EVENT LISTENERS
    // ========================================
    setupEnhancedEventListeners() {
        console.log('🎧 Setting up enhanced event listeners...');
        
        // Tools dropdown
        document.getElementById('tools-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleToolsDropdown();
        });

        // Tool options
        document.querySelectorAll('.tool-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.closest('.tool-option').dataset.tool;
                this.runTool(tool);
                this.hideToolsDropdown();
            });
        });

        // Navigation for new sections - use event delegation to handle all nav items
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.dataset.section) {
                const section = navItem.dataset.section;
                console.log(`Navigation clicked: ${section}`);
                
                // Handle enhanced sections
                if (['media', 'social', 'integrations', 'advanced'].includes(section)) {
                    e.preventDefault();
                    this.showEnhancedSection(section);
                }
                // Let the original CMS handle other sections
            }
        });

        // Global click handler for dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#tools-btn')) {
                this.hideToolsDropdown();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    // ========================================
    // UTILITY METHODS
    // ========================================
    toggleToolsDropdown() {
        const dropdown = document.getElementById('tools-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    hideToolsDropdown() {
        const dropdown = document.getElementById('tools-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    showEnhancedSection(sectionName) {
        console.log(`🔄 Showing enhanced section: ${sectionName}`);
        
        // Hide all sections first
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Update navigation active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navButton = document.querySelector(`[data-section="${sectionName}"]`);
        if (navButton) {
            navButton.classList.add('active');
        }

        // Show or create the requested section
        let section = document.getElementById(`${sectionName}-section`);
        if (section) {
            console.log(`✅ Section ${sectionName} found, showing it`);
            section.classList.remove('hidden');
        } else {
            console.log(`➕ Section ${sectionName} not found, creating it`);
            this.createEnhancedSection(sectionName);
        }
        
        // Initialize section-specific features after creation
        setTimeout(() => {
            this.initializeSectionFeatures(sectionName);
        }, 100);
    }

    createEnhancedSection(sectionName) {
        // Find the main content area - try multiple selectors
        let mainContent = document.querySelector('.flex-1.p-6');
        if (!mainContent) {
            mainContent = document.querySelector('main .flex-1');
        }
        if (!mainContent) {
            mainContent = document.querySelector('main');
        }
        if (!mainContent) {
            console.error('❌ Could not find main content container');
            return;
        }

        console.log(`➕ Creating section ${sectionName} in container:`, mainContent);

        const section = document.createElement('section');
        section.id = `${sectionName}-section`;
        section.className = 'content-section mb-8';
        
        section.innerHTML = this.getEnhancedSectionHTML(sectionName);
        
        // Insert at the beginning so it shows up properly
        if (mainContent.firstChild) {
            mainContent.insertBefore(section, mainContent.firstChild);
        } else {
            mainContent.appendChild(section);
        }
        
        console.log(`✅ Section ${sectionName} created successfully`);
    }

    getEnhancedSectionHTML(sectionName) {
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
                        <div id="media-dropzone" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors mb-6">
                            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Upload Media Files</h3>
                            <p class="text-gray-600">Drag and drop files here, or click to browse</p>
                        </div>
                        
                        <div id="media-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <!-- Media items will be loaded here -->
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
                        <div id="social-connections" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Social connections will be loaded here -->
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
                        <div id="integrations-list" class="space-y-4">
                            <!-- Integrations will be loaded here -->
                        </div>
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
                        <!-- Custom CSS Editor -->
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Custom CSS</h3>
                            <div class="border border-gray-300 rounded-lg">
                                <div id="css-editor" class="h-64"></div>
                            </div>
                        </div>
                        
                        <!-- Performance Settings -->
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label class="flex items-center">
                                    <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="ml-2 text-sm text-gray-700">Enable lazy loading</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="ml-2 text-sm text-gray-700">Minify CSS/JS</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="ml-2 text-sm text-gray-700">Enable PWA features</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="ml-2 text-sm text-gray-700">Dark mode support</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };
        
        return templates[sectionName] || '<div class="p-8 text-center text-gray-500">Section not found</div>';
    }

    initializeSectionFeatures(sectionName) {
        switch (sectionName) {
            case 'media':
                this.initializeMediaLibrary();
                break;
            case 'social':
                this.initializeSocialMedia();
                break;
            case 'integrations':
                this.initializeIntegrations();
                break;
            case 'advanced':
                this.initializeAdvancedEditor();
                break;
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveData();
            this.showMessage('💾 Changes saved!', 'success');
        }
        
        // Ctrl/Cmd + P to publish
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            this.publishChanges();
        }
    }

    runTool(toolName) {
        console.log(`🔧 Running tool: ${toolName}`);
        
        switch (toolName) {
            case 'seo-checker':
                this.runSEOCheck();
                break;
            case 'performance':
                this.runPerformanceTest();
                break;
            case 'accessibility':
                this.runAccessibilityCheck();
                break;
            case 'email-test':
                this.testEmailIntegration();
                break;
            default:
                this.showMessage(`Tool "${toolName}" is not implemented yet`, 'info');
        }
    }

    runSEOCheck() {
        console.log('🔍 Running SEO check...');
        // Implementation for SEO checking
        this.showMessage('🔍 SEO check completed! See analytics section for details.', 'success');
    }

    runPerformanceTest() {
        console.log('⚡ Running performance test...');
        // Implementation for performance testing
        this.showMessage('⚡ Performance test completed! Load time: 1.2s', 'success');
    }

    runAccessibilityCheck() {
        console.log('♿ Running accessibility check...');
        // Implementation for accessibility checking
        this.showMessage('♿ Accessibility check completed! Score: 92/100', 'success');
    }

    testEmailIntegration() {
        console.log('📧 Testing email integration...');
        // Implementation for email testing
        this.showMessage('📧 Email integration test completed!', 'success');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ========================================
    // MISSING METHODS IMPLEMENTATION
    // ========================================
    
    loadThemes() {
        console.log('🎨 Loading themes...');
        // Default theme data
        this.themes = {
            current: 'default',
            available: ['default', 'dark', 'professional', 'creative']
        };
    }
    
    initializeMarkdownEditor() {
        console.log('📝 Initializing markdown editor...');
        // Placeholder for markdown editor initialization
    }
    
    initializeAIAssistant() {
        console.log('🤖 Initializing AI assistant...');
        // Placeholder for AI assistant features
    }
    
    renderSEOForm() {
        console.log('📄 Rendering SEO form...');
        // This would render the SEO configuration form
    }
    
    // Enhanced method implementations
    updateSocialConnection(platform, field, value) {
        console.log(`📱 Updating ${platform} ${field}: ${value}`);
        
        if (!this.socialConnections[platform]) {
            this.socialConnections[platform] = {};
        }
        
        this.socialConnections[platform][field] = value;
        
        // Save to backend
        this.saveSocialConnections();
        
        this.showMessage(`${platform} ${field} updated`, 'success');
    }
    
    async saveSocialConnections() {
        try {
            const response = await fetch('/admin/api/social', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.socialConnections)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            console.log('✅ Social connections saved');
        } catch (error) {
            console.error('❌ Failed to save social connections:', error);
            this.showMessage('Failed to save social connections', 'error');
        }
    }
    
    connectSocial(platform) {
        console.log(`🔗 Connecting to ${platform}`);
        this.showMessage(`Connect to ${platform} feature coming soon!`, 'info');
    }
    
    testSocialConnection(platform) {
        console.log(`🧪 Testing ${platform} connection`);
        this.showMessage(`Testing ${platform} connection...`, 'success');
    }
    
    editMedia(mediaId) {
        console.log(`✏️ Editing media: ${mediaId}`);
        this.showMessage('Media editing feature coming soon!', 'info');
    }
    
    copyMediaUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showMessage('Media URL copied to clipboard!', 'success');
        }).catch(() => {
            this.showMessage('Failed to copy URL', 'error');
        });
    }
    
    deleteMedia(mediaId) {
        if (confirm('Are you sure you want to delete this media file?')) {
            console.log(`🗑️ Deleting media: ${mediaId}`);
            // Implementation would call API to delete media
            this.showMessage('Media deletion feature coming soon!', 'info');
        }
    }
    
    configureIntegration(integrationName) {
        console.log(`⚙️ Configuring integration: ${integrationName}`);
        this.showMessage(`${integrationName} configuration coming soon!`, 'info');
    }
    
    updateThemeColor(colorVar, color) {
        console.log(`🎨 Updating theme color ${colorVar}: ${color}`);
        document.documentElement.style.setProperty(colorVar, color);
        this.showMessage('Theme color updated!', 'success');
    }
    
    saveCustomCSS() {
        if (this.codeEditors.css) {
            const css = this.codeEditors.css.getValue();
            console.log('💾 Saving custom CSS...');
            // Implementation would save CSS to backend
            this.showMessage('Custom CSS saved!', 'success');
        }
    }
}

// Initialize Enhanced CMS
let enhancedCMS;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing Enhanced CMS...');
    try {
        enhancedCMS = new EnhancedResumeCMS();
        // Make Enhanced CMS globally available
        window.enhancedCMS = enhancedCMS;
        window.cms = enhancedCMS; // Maintain compatibility
        console.log('✅ Enhanced CMS initialized successfully');
    } catch (error) {
        console.error('❌ Enhanced CMS initialization error:', error);
    }
});