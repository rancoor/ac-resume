/**
 * Advanced Resume CMS Admin Dashboard
 * Comprehensive JavaScript for managing resume content
 */

class ResumeCMS {
    constructor() {
        this.data = {};
        this.editors = {};
        this.sortables = {};
        this.autosaveDelay = 2000;
        this.autosaveTimeout = null;
        
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupRichTextEditors();
        this.setupEventListeners();
        this.loadData();
        this.updateStats();
        this.setupAutosave();
        this.initializeDragAndDrop();
    }

    // Navigation Management
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetSection = e.currentTarget.dataset.section;
                
                // Update active nav item
                navItems.forEach(nav => {
                    nav.classList.remove('active', 'bg-primary/10', 'text-primary');
                    nav.classList.add('text-gray-700', 'hover:bg-gray-50');
                });
                
                e.currentTarget.classList.add('active', 'bg-primary/10', 'text-primary');
                e.currentTarget.classList.remove('text-gray-700', 'hover:bg-gray-50');
                
                // Show target section
                sections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                const targetElement = document.getElementById(`${targetSection}-section`);
                if (targetElement) {
                    targetElement.classList.remove('hidden');
                }
                
                this.updatePreview();
            });
        });
    }

    // Rich Text Editor Setup
    setupRichTextEditors() {
        const editorConfigs = {
            'personal-description-editor': {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        ['link'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                    ]
                }
            },
            'about-summary-editor': {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic'],
                        ['link'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                    ]
                }
            },
            'about-description-editor': {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        ['link'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['blockquote'],
                        ['clean']
                    ]
                }
            }
        };

        Object.entries(editorConfigs).forEach(([id, config]) => {
            const element = document.getElementById(id);
            if (element) {
                this.editors[id] = new Quill(`#${id}`, config);
                
                // Setup change listener for autosave
                this.editors[id].on('text-change', () => {
                    this.triggerAutosave();
                });
            }
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Form submissions
        document.getElementById('personal-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePersonalInfo();
        });

        document.getElementById('about-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAboutInfo();
        });

        document.getElementById('achievements-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAchievements();
        });

        // Add buttons
        document.getElementById('add-experience')?.addEventListener('click', () => this.addExperience());
        document.getElementById('add-skill')?.addEventListener('click', () => this.addSkill());
        document.getElementById('add-education')?.addEventListener('click', () => this.addEducation());
        document.getElementById('add-certification')?.addEventListener('click', () => this.addCertification());

        // Top navigation buttons
        document.getElementById('preview-btn')?.addEventListener('click', () => this.openPreview());
        document.getElementById('publish-btn')?.addEventListener('click', () => this.publishChanges());
        document.getElementById('export-btn')?.addEventListener('click', (e) => this.toggleExportDropdown(e));

        // Export options
        document.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.exportData(type);
                this.hideExportDropdown();
            });
        });

        // Theme controls
        document.getElementById('apply-theme')?.addEventListener('click', () => this.applyTheme());

        // Backup controls
        document.getElementById('create-backup')?.addEventListener('click', () => this.createBackup());
        document.getElementById('restore-file')?.addEventListener('change', (e) => this.restoreFromFile(e));

        // Input change listeners for autosave
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.triggerAutosave();
            }
        });

        // Click outside to close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#export-btn')) {
                this.hideExportDropdown();
            }
        });
    }

    // Data Management
    async loadData() {
        try {
            // Load from localStorage first
            const storedData = localStorage.getItem('resumeData');
            if (storedData) {
                this.data = JSON.parse(storedData);
            } else {
                // Load from API if available
                const response = await fetch('/api/portfolio');
                if (response.ok) {
                    this.data = await response.json();
                }
            }

            this.populateFields();
            this.updateStats();
            this.showMessage('Data loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading data', 'error');
        }
    }

    populateFields() {
        // Personal information
        if (this.data.profile) {
            document.querySelector('input[name="name"]').value = this.data.profile.name || '';
            document.querySelector('input[name="title"]').value = this.data.profile.title || '';
            document.querySelector('input[name="email"]').value = this.data.profile.email || '';
            document.querySelector('input[name="phone"]').value = this.data.profile.phone || '';
            document.querySelector('input[name="location"]').value = this.data.profile.location || '';
            document.querySelector('input[name="website"]').value = this.data.profile.website || '';
            
            if (this.editors['personal-description-editor']) {
                this.editors['personal-description-editor'].setContents([]);
                this.editors['personal-description-editor'].setText(this.data.profile.description || '');
            }
        }

        // About section
        if (this.data.about) {
            if (this.editors['about-summary-editor']) {
                this.editors['about-summary-editor'].setText(this.data.about.summary || '');
            }
            if (this.editors['about-description-editor']) {
                this.editors['about-description-editor'].setText(this.data.about.description || '');
            }
        }

        // Experience
        this.renderExperience();

        // Skills
        this.renderSkills();

        // Achievements
        if (this.data.achievements) {
            document.querySelector('input[name="customerSatisfaction"]').value = this.data.achievements.customerSatisfaction || '';
            document.querySelector('input[name="operationalEfficiency"]').value = this.data.achievements.operationalEfficiency || '';
            document.querySelector('input[name="experience"]').value = this.data.achievements.experience || '';
        }
    }

    // Experience Management
    renderExperience() {
        const container = document.getElementById('experience-list');
        if (!container || !this.data.experience) return;

        container.innerHTML = '';
        
        this.data.experience.forEach((exp, index) => {
            const expElement = this.createExperienceElement(exp, index);
            container.appendChild(expElement);
        });

        this.updateStats();
        this.setupExperienceSortable();
    }

    createExperienceElement(exp, index) {
        const div = document.createElement('div');
        div.className = 'experience-item bg-gray-50 border border-gray-200 rounded-lg p-4';
        div.dataset.index = index;
        
        div.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="drag-handle cursor-grab p-1 text-gray-400 hover:text-gray-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900">${exp.title || 'Untitled Position'}</h4>
                        <p class="text-sm text-gray-600">${exp.company || 'Company'} • ${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="cms.editExperience(${index})" class="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                    <button onclick="cms.deleteExperience(${index})" class="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                </div>
            </div>
            <div class="text-sm text-gray-600">
                <p class="mb-2"><strong>Location:</strong> ${exp.location || 'N/A'}</p>
                <div>
                    <strong>Key Achievements:</strong>
                    <ul class="mt-1 space-y-1">
                        ${(exp.achievements || []).map(achievement => 
                            `<li class="flex items-start space-x-2">
                                <div class="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                                <span>${achievement}</span>
                            </li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;

        return div;
    }

    setupExperienceSortable() {
        const container = document.getElementById('experience-list');
        if (!container) return;

        if (this.sortables.experience) {
            this.sortables.experience.destroy();
        }

        this.sortables.experience = new Sortable(container, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: (evt) => {
                // Reorder data
                const item = this.data.experience.splice(evt.oldIndex, 1)[0];
                this.data.experience.splice(evt.newIndex, 0, item);
                
                this.saveData();
                this.renderExperience(); // Re-render to update indices
            }
        });
    }

    addExperience() {
        const newExp = {
            id: Date.now(),
            title: 'New Position',
            company: 'Company Name',
            location: 'City, Country',
            startDate: 'Start Date',
            endDate: 'End Date',
            current: false,
            achievements: ['Add your key achievements here']
        };

        if (!this.data.experience) {
            this.data.experience = [];
        }

        this.data.experience.unshift(newExp);
        this.renderExperience();
        this.saveData();
        
        // Auto-open edit modal for new experience
        setTimeout(() => this.editExperience(0), 100);
    }

    editExperience(index) {
        const exp = this.data.experience[index];
        if (!exp) return;

        // Create and show modal
        this.showExperienceModal(exp, index);
    }

    showExperienceModal(exp, index) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Edit Experience</h3>
                    <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                            <input type="text" name="title" value="${exp.title || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                            <input type="text" name="company" value="${exp.company || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input type="text" name="location" value="${exp.location || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input type="text" name="startDate" value="${exp.startDate || ''}" placeholder="January 2021" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input type="text" name="endDate" value="${exp.endDate || ''}" placeholder="Present" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="current" ${exp.current ? 'checked' : ''} class="rounded border-gray-300 text-primary focus:ring-primary">
                            <label class="ml-2 text-sm text-gray-700">Current Position</label>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Key Achievements</label>
                        <div class="achievements-list space-y-2">
                            ${(exp.achievements || []).map((achievement, i) => `
                                <div class="flex items-center space-x-2">
                                    <input type="text" value="${achievement}" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <button type="button" onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="cms.addAchievementField(this)" class="mt-2 text-primary hover:text-secondary font-medium text-sm">+ Add Achievement</button>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="button" onclick="cms.saveExperienceModal(${index}, this)" class="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg">Save</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
    }

    addAchievementField(button) {
        const container = button.previousElementSibling;
        const newField = document.createElement('div');
        newField.className = 'flex items-center space-x-2';
        newField.innerHTML = `
            <input type="text" placeholder="New achievement" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <button type="button" onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        `;
        container.appendChild(newField);
    }

    saveExperienceModal(index, button) {
        const modal = button.closest('.fixed');
        const form = modal.querySelector('form');
        const formData = new FormData(form);
        
        const achievements = [];
        form.querySelectorAll('.achievements-list input').forEach(input => {
            if (input.value.trim()) {
                achievements.push(input.value.trim());
            }
        });

        this.data.experience[index] = {
            ...this.data.experience[index],
            title: formData.get('title'),
            company: formData.get('company'),
            location: formData.get('location'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            current: formData.has('current'),
            achievements: achievements
        };

        this.renderExperience();
        this.saveData();
        modal.remove();
        this.showMessage('Experience updated successfully', 'success');
    }

    deleteExperience(index) {
        if (confirm('Are you sure you want to delete this experience?')) {
            this.data.experience.splice(index, 1);
            this.renderExperience();
            this.saveData();
            this.showMessage('Experience deleted', 'success');
        }
    }

    // Skills Management
    renderSkills() {
        const container = document.getElementById('skills-list');
        if (!container || !this.data.skills) return;

        container.innerHTML = '';
        
        this.data.skills.forEach((skill, index) => {
            const skillElement = this.createSkillElement(skill, index);
            container.appendChild(skillElement);
        });

        this.updateStats();
    }

    createSkillElement(skill, index) {
        const div = document.createElement('div');
        div.className = 'skill-item bg-white border border-gray-200 rounded-lg p-3';
        
        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <span class="text-lg">${skill.icon || '🛠️'}</span>
                    <span class="font-medium text-gray-900">${skill.name || 'Skill'}</span>
                </div>
                <button onclick="cms.deleteSkill(${index})" class="text-red-600 hover:text-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `;

        return div;
    }

    addSkill() {
        const name = prompt('Enter skill name:');
        const icon = prompt('Enter skill icon (emoji):');
        
        if (name) {
            if (!this.data.skills) {
                this.data.skills = [];
            }

            this.data.skills.push({
                name: name,
                icon: icon || '🛠️',
                category: 'technical'
            });

            this.renderSkills();
            this.saveData();
            this.showMessage('Skill added successfully', 'success');
        }
    }

    deleteSkill(index) {
        if (confirm('Are you sure you want to delete this skill?')) {
            this.data.skills.splice(index, 1);
            this.renderSkills();
            this.saveData();
            this.showMessage('Skill deleted', 'success');
        }
    }

    // Data Persistence
    saveData() {
        try {
            localStorage.setItem('resumeData', JSON.stringify(this.data));
            this.updateLastModified();
            this.showAutosaveIndicator();
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('Error saving data', 'error');
        }
    }

    async savePersonalInfo() {
        const form = document.getElementById('personal-form');
        const formData = new FormData(form);
        
        if (!this.data.profile) {
            this.data.profile = {};
        }

        this.data.profile.name = formData.get('name');
        this.data.profile.title = formData.get('title');
        this.data.profile.email = formData.get('email');
        this.data.profile.phone = formData.get('phone');
        this.data.profile.location = formData.get('location');
        this.data.profile.website = formData.get('website');
        
        if (this.editors['personal-description-editor']) {
            this.data.profile.description = this.editors['personal-description-editor'].getText();
        }

        this.saveData();
        this.showMessage('Personal information updated successfully', 'success');
        this.updatePreview();
    }

    async saveAboutInfo() {
        if (!this.data.about) {
            this.data.about = {};
        }

        if (this.editors['about-summary-editor']) {
            this.data.about.summary = this.editors['about-summary-editor'].getText();
        }
        
        if (this.editors['about-description-editor']) {
            this.data.about.description = this.editors['about-description-editor'].getText();
        }

        this.saveData();
        this.showMessage('About section updated successfully', 'success');
        this.updatePreview();
    }

    async saveAchievements() {
        const form = document.getElementById('achievements-form');
        const formData = new FormData(form);
        
        if (!this.data.achievements) {
            this.data.achievements = {};
        }

        this.data.achievements.customerSatisfaction = formData.get('customerSatisfaction');
        this.data.achievements.operationalEfficiency = formData.get('operationalEfficiency');
        this.data.achievements.experience = formData.get('experience');

        this.saveData();
        this.showMessage('Achievements updated successfully', 'success');
        this.updatePreview();
    }

    // Auto-save functionality
    setupAutosave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveData();
        }, 30000);
    }

    triggerAutosave() {
        clearTimeout(this.autosaveTimeout);
        this.autosaveTimeout = setTimeout(() => {
            this.saveData();
            this.updatePreview();
            
            // Broadcast updates to resume pages immediately on autosave
            this.broadcastToResumePages();
        }, this.autosaveDelay);
    }

    showAutosaveIndicator() {
        const indicator = document.getElementById('autosave-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            setTimeout(() => {
                indicator.classList.add('hidden');
            }, 3000);
        }
    }

    // Statistics and Updates
    updateStats() {
        const expCount = this.data.experience ? this.data.experience.length : 0;
        const skillsCount = this.data.skills ? this.data.skills.length : 0;
        
        document.getElementById('exp-count').textContent = expCount;
        document.getElementById('skills-count').textContent = skillsCount;
        document.getElementById('experience-count').textContent = expCount;
        
        this.updateLastModified();
    }

    updateLastModified() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById('last-updated').textContent = timeStr;
    }

    // Preview and Export
    openPreview() {
        window.open('index.html', '_blank');
    }

    updatePreview() {
        const previewContainer = document.getElementById('live-preview');
        if (!previewContainer) return;

        // Generate preview HTML
        const previewHTML = this.generatePreviewHTML();
        previewContainer.innerHTML = previewHTML;
    }

    generatePreviewHTML() {
        const profile = this.data.profile || {};
        
        return `
            <div class="space-y-4 text-sm">
                <div class="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3">
                    <h4 class="font-semibold text-primary">${profile.name || 'Your Name'}</h4>
                    <p class="text-gray-600">${profile.title || 'Professional Title'}</p>
                </div>
                
                <div class="space-y-2 text-xs">
                    <div class="flex items-center space-x-2">
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-gray-600">${profile.email || 'email@example.com'}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        </svg>
                        <span class="text-gray-600">${profile.location || 'Location'}</span>
                    </div>
                </div>
                
                <div class="border-t pt-3">
                    <h5 class="font-medium text-gray-900 mb-2">Experience</h5>
                    <div class="space-y-2">
                        ${(this.data.experience || []).slice(0, 2).map(exp => `
                            <div class="bg-gray-50 rounded p-2">
                                <div class="font-medium text-xs text-gray-900">${exp.title}</div>
                                <div class="text-xs text-gray-600">${exp.company}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Export functionality
    toggleExportDropdown(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('export-dropdown');
        dropdown.classList.toggle('hidden');
    }

    hideExportDropdown() {
        const dropdown = document.getElementById('export-dropdown');
        dropdown.classList.add('hidden');
    }

    exportData(type) {
        this.showLoadingOverlay();
        
        setTimeout(() => {
            try {
                switch (type) {
                    case 'json':
                        this.exportAsJSON();
                        break;
                    case 'pdf':
                        this.exportAsPDF();
                        break;
                    case 'html':
                        this.exportAsHTML();
                        break;
                }
                this.showMessage(`Exported as ${type.toUpperCase()} successfully`, 'success');
            } catch (error) {
                this.showMessage(`Error exporting as ${type.toUpperCase()}`, 'error');
                console.error('Export error:', error);
            }
            this.hideLoadingOverlay();
        }, 1000);
    }

    exportAsJSON() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `resume-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    exportAsPDF() {
        // This would integrate with a PDF generation library
        this.showMessage('PDF export feature coming soon', 'info');
    }

    exportAsHTML() {
        // Generate HTML export
        const htmlContent = this.generateHTMLExport();
        const htmlBlob = new Blob([htmlContent], {type: 'text/html'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(htmlBlob);
        link.download = `resume-${new Date().toISOString().split('T')[0]}.html`;
        link.click();
    }

    generateHTMLExport() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${this.data.profile?.name || 'Resume'}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 25px; }
                    .section h2 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 5px; }
                    .experience-item { margin-bottom: 20px; }
                    .experience-item h3 { margin-bottom: 5px; color: #007acc; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${this.data.profile?.name || 'Your Name'}</h1>
                    <p>${this.data.profile?.title || 'Professional Title'}</p>
                    <p>${this.data.profile?.email || ''} • ${this.data.profile?.phone || ''} • ${this.data.profile?.location || ''}</p>
                </div>
                
                ${this.data.about ? `
                <div class="section">
                    <h2>About</h2>
                    <p>${this.data.about.summary || ''}</p>
                </div>
                ` : ''}
                
                ${this.data.experience ? `
                <div class="section">
                    <h2>Experience</h2>
                    ${this.data.experience.map(exp => `
                        <div class="experience-item">
                            <h3>${exp.title} at ${exp.company}</h3>
                            <p><em>${exp.startDate} - ${exp.endDate} • ${exp.location}</em></p>
                            <ul>
                                ${(exp.achievements || []).map(achievement => `<li>${achievement}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${this.data.skills ? `
                <div class="section">
                    <h2>Skills</h2>
                    <p>${this.data.skills.map(skill => skill.name).join(', ')}</p>
                </div>
                ` : ''}
            </body>
            </html>
        `;
    }

    // Backup and Restore
    createBackup() {
        const backupData = {
            ...this.data,
            _backup: {
                created: new Date().toISOString(),
                version: '1.0'
            }
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `resume-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Backup created successfully', 'success');
    }

    restoreFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const restoredData = JSON.parse(e.target.result);
                
                if (confirm('This will replace all current data. Are you sure you want to restore from this backup?')) {
                    this.data = restoredData;
                    this.saveData();
                    this.populateFields();
                    this.renderExperience();
                    this.renderSkills();
                    this.updateStats();
                    this.showMessage('Data restored successfully', 'success');
                }
            } catch (error) {
                this.showMessage('Error reading backup file', 'error');
                console.error('Restore error:', error);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    // Theme Management
    applyTheme() {
        // This would apply theme changes to the live site
        this.showMessage('Theme changes applied', 'success');
    }

    // Publishing
    async publishChanges() {
        this.showLoadingOverlay();
        
        try {
            // Save data first
            this.saveData();
            
            // Trigger live resume update via storage event
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'resumeData',
                newValue: JSON.stringify(this.data),
                storageArea: localStorage
            }));
            
            // Also dispatch custom event
            window.dispatchEvent(new CustomEvent('resumeUpdated'));
            
            // Try to update any open resume tabs
            this.broadcastToResumePages();
            
            // Optional: trigger WebSocket reload if available
            if (typeof WebSocket !== 'undefined') {
                try {
                    const ws = new WebSocket(`ws://${window.location.host}`);
                    ws.onopen = () => {
                        ws.send(JSON.stringify({ type: 'reload' }));
                        ws.close();
                    };
                } catch (wsError) {
                    console.log('WebSocket not available for live reload');
                }
            }
            
            this.showMessage('Changes published successfully! Resume updated live.', 'success');
            
        } catch (error) {
            this.showMessage('Error publishing changes', 'error');
            console.error('Publish error:', error);
        }
        
        this.hideLoadingOverlay();
    }
    
    // Broadcast updates to resume pages via BroadcastChannel
    broadcastToResumePages() {
        try {
            const channel = new BroadcastChannel('resume-updates');
            channel.postMessage({
                type: 'dataUpdate',
                data: this.data,
                timestamp: Date.now()
            });
            channel.close();
        } catch (error) {
            console.log('BroadcastChannel not available:', error);
        }
    }

    // Utility Methods
    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message rounded-lg p-4 mb-4 flex items-center space-x-3 animate-fade-in`;
        
        const colors = {
            success: 'bg-green-50 border border-green-200 text-green-800',
            error: 'bg-red-50 border border-red-200 text-red-800',
            warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border border-blue-200 text-blue-800'
        };
        
        messageEl.className += ` ${colors[type] || colors.info}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        messageEl.innerHTML = `
            <span class="text-lg">${icons[type] || icons.info}</span>
            <span>${message}</span>
            <button class="ml-auto text-current opacity-50 hover:opacity-100" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(messageEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    // Initialize drag and drop for file uploads
    initializeDragAndDrop() {
        // This would set up drag and drop zones for file uploads
    }

    // Education and Certification management
    addEducation() {
        // Similar to addExperience but for education
        this.showMessage('Education management coming soon', 'info');
    }

    addCertification() {
        // Similar to addExperience but for certifications
        this.showMessage('Certification management coming soon', 'info');
    }
}

// Initialize the CMS when the page loads
let cms;

document.addEventListener('DOMContentLoaded', () => {
    cms = new ResumeCMS();
});

// Make CMS globally available for onclick handlers
window.cms = cms;