// Dashboard functionality
class PortfolioAdmin {
    constructor() {
        this.portfolioData = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPortfolioData();
        this.populateForms();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Form submissions
        document.getElementById('profile-form').addEventListener('submit', (e) => this.handleProfileSubmit(e));
        document.getElementById('about-form').addEventListener('submit', (e) => this.handleAboutSubmit(e));
        document.getElementById('achievements-form').addEventListener('submit', (e) => this.handleAchievementsSubmit(e));

        // Experience modal
        document.getElementById('add-experience').addEventListener('click', () => this.openExperienceModal());
        document.getElementById('cancel-experience').addEventListener('click', () => this.closeExperienceModal());
        document.getElementById('experience-form').addEventListener('submit', (e) => this.handleExperienceSubmit(e));
        document.getElementById('delete-experience').addEventListener('click', () => this.deleteExperience());

        // Dynamic form elements
        document.getElementById('add-certification').addEventListener('click', () => this.addCertification());
        document.getElementById('add-skill').addEventListener('click', () => this.addSkill());
        document.getElementById('add-achievement').addEventListener('click', () => this.addAchievementField());

        // Publish changes
        document.getElementById('publish-btn').addEventListener('click', () => this.publishChanges());

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'border-accent', 'text-accent');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        activeTab.classList.add('active', 'border-accent', 'text-accent');
        activeTab.classList.remove('border-transparent', 'text-gray-500');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    async loadPortfolioData() {
        try {
            const response = await fetch('/admin/api/portfolio');
            this.portfolioData = await response.json();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showMessage('Error loading portfolio data', 'error');
        }
    }

    populateForms() {
        if (!this.portfolioData) return;

        // Populate profile form
        const profileForm = document.getElementById('profile-form');
        const profile = this.portfolioData.profile;
        Object.keys(profile).forEach(key => {
            const input = profileForm.querySelector(`[name="${key}"]`);
            if (input) input.value = profile[key] || '';
        });

        // Populate about form
        this.populateAboutForm();

        // Populate experience list
        this.populateExperienceList();

        // Populate skills
        this.populateSkills();

        // Populate achievements
        this.populateAchievements();
    }

    populateAboutForm() {
        const aboutForm = document.getElementById('about-form');
        const about = this.portfolioData.about;

        aboutForm.querySelector('[name="summary"]').value = about.summary || '';
        aboutForm.querySelector('[name="description"]').value = about.description || '';

        // Education
        aboutForm.querySelector('[name="education.degree"]').value = about.education?.degree || '';
        aboutForm.querySelector('[name="education.institution"]').value = about.education?.institution || '';
        aboutForm.querySelector('[name="education.years"]').value = about.education?.years || '';
        aboutForm.querySelector('[name="education.description"]').value = about.education?.description || '';

        // Certifications
        this.populateCertifications();
    }

    populateCertifications() {
        const container = document.getElementById('certifications-container');
        container.innerHTML = '';

        this.portfolioData.about.certifications?.forEach((cert, index) => {
            this.addCertification(cert, index);
        });
    }

    addCertification(cert = null, index = null) {
        const container = document.getElementById('certifications-container');
        const certIndex = index !== null ? index : container.children.length;
        
        const certDiv = document.createElement('div');
        certDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg';
        certDiv.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                <input type="text" name="certifications[${certIndex}].name" value="${cert?.name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                <input type="text" name="certifications[${certIndex}].issuer" value="${cert?.issuer || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input type="text" name="certifications[${certIndex}].year" value="${cert?.year || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
            </div>
            <div class="col-span-full">
                <button type="button" onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-700 font-medium">Remove Certification</button>
            </div>
        `;
        
        container.appendChild(certDiv);
    }

    populateExperienceList() {
        const container = document.getElementById('experience-list');
        container.innerHTML = '';

        this.portfolioData.experience?.forEach(exp => {
            const expDiv = document.createElement('div');
            expDiv.className = 'bg-gray-50 rounded-lg p-6 border';
            expDiv.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${exp.title}</h3>
                        <p class="text-gray-600">${exp.company} - ${exp.location}</p>
                        <p class="text-sm text-gray-500">${exp.startDate} - ${exp.endDate}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="admin.editExperience(${exp.id})" class="text-accent hover:text-orange font-medium">Edit</button>
                        <button onclick="admin.deleteExperience(${exp.id})" class="text-red-600 hover:text-red-700 font-medium">Delete</button>
                    </div>
                </div>
                <div class="space-y-1">
                    ${exp.achievements?.map(achievement => `<p class="text-gray-700">• ${achievement}</p>`).join('') || ''}
                </div>
            `;
            container.appendChild(expDiv);
        });
    }

    populateSkills() {
        const container = document.getElementById('skills-container');
        container.innerHTML = '';

        this.portfolioData.skills?.forEach((skill, index) => {
            this.addSkill(skill, index);
        });
    }

    addSkill(skill = null, index = null) {
        const container = document.getElementById('skills-container');
        const skillIndex = index !== null ? index : container.children.length;
        
        const skillDiv = document.createElement('div');
        skillDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg';
        skillDiv.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                <input type="text" name="skills[${skillIndex}].name" value="${skill?.name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                <input type="text" name="skills[${skillIndex}].icon" value="${skill?.icon || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select name="skills[${skillIndex}].category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                    <option value="technical" ${skill?.category === 'technical' ? 'selected' : ''}>Technical</option>
                    <option value="soft" ${skill?.category === 'soft' ? 'selected' : ''}>Soft Skills</option>
                    <option value="other" ${skill?.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="col-span-full">
                <button type="button" onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-700 font-medium">Remove Skill</button>
            </div>
        `;
        
        container.appendChild(skillDiv);
    }

    populateAchievements() {
        const form = document.getElementById('achievements-form');
        const achievements = this.portfolioData.achievements;

        form.querySelector('[name="customerSatisfaction"]').value = achievements?.customerSatisfaction || '';
        form.querySelector('[name="operationalEfficiency"]').value = achievements?.operationalEfficiency || '';
        form.querySelector('[name="experience"]').value = achievements?.experience || '';
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/admin/api/portfolio/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('Profile updated successfully!', 'success');
                this.portfolioData.profile = result.data;
            } else {
                this.showMessage('Error updating profile', 'error');
            }
        } catch (error) {
            this.showMessage('Network error', 'error');
        }
    }

    async handleAboutSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = this.parseFormData(formData);

        try {
            const response = await fetch('/admin/api/portfolio/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('About section updated successfully!', 'success');
                this.portfolioData.about = result.data;
            } else {
                this.showMessage('Error updating about section', 'error');
            }
        } catch (error) {
            this.showMessage('Network error', 'error');
        }
    }

    async handleAchievementsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/admin/api/portfolio/achievements', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('Achievements updated successfully!', 'success');
                this.portfolioData.achievements = result.data;
            } else {
                this.showMessage('Error updating achievements', 'error');
            }
        } catch (error) {
            this.showMessage('Network error', 'error');
        }
    }

    openExperienceModal(experience = null) {
        const modal = document.getElementById('experience-modal');
        const form = document.getElementById('experience-form');
        const deleteBtn = document.getElementById('delete-experience');

        // Clear form
        form.reset();
        document.getElementById('achievements-list').innerHTML = '';

        if (experience) {
            // Edit mode
            Object.keys(experience).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = experience[key];
                    } else {
                        input.value = experience[key] || '';
                    }
                }
            });

            // Add achievements
            experience.achievements?.forEach(achievement => {
                this.addAchievementField(achievement);
            });

            deleteBtn.classList.remove('hidden');
        } else {
            // Add mode
            deleteBtn.classList.add('hidden');
            this.addAchievementField(); // Add one empty field
        }

        modal.classList.remove('hidden');
    }

    closeExperienceModal() {
        document.getElementById('experience-modal').classList.add('hidden');
    }

    addAchievementField(value = '') {
        const container = document.getElementById('achievements-list');
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'flex space-x-2';
        achievementDiv.innerHTML = `
            <input type="text" name="achievements[]" value="${value}" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" placeholder="Enter achievement">
            <button type="button" onclick="this.parentElement.remove()" class="px-3 py-2 text-red-600 hover:text-red-700">Remove</button>
        `;
        container.appendChild(achievementDiv);
    }

    async handleExperienceSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = this.parseFormData(formData);
        
        const isEdit = !!data.id;
        const url = isEdit ? `/admin/api/portfolio/experience/${data.id}` : '/admin/api/portfolio/experience';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage(`Experience ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
                await this.loadPortfolioData();
                this.populateExperienceList();
                this.closeExperienceModal();
            } else {
                this.showMessage('Error saving experience', 'error');
            }
        } catch (error) {
            this.showMessage('Network error', 'error');
        }
    }

    editExperience(id) {
        const experience = this.portfolioData.experience.find(exp => exp.id === id);
        if (experience) {
            this.openExperienceModal(experience);
        }
    }

    async deleteExperience(id = null) {
        const experienceId = id || document.querySelector('[name="id"]').value;
        
        if (!confirm('Are you sure you want to delete this experience?')) return;

        try {
            const response = await fetch(`/admin/api/portfolio/experience/${experienceId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('Experience deleted successfully!', 'success');
                await this.loadPortfolioData();
                this.populateExperienceList();
                if (!id) this.closeExperienceModal(); // Only close modal if called from modal
            } else {
                this.showMessage('Error deleting experience', 'error');
            }
        } catch (error) {
            this.showMessage('Network error', 'error');
        }
    }

    parseFormData(formData) {
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (key.includes('[') && key.includes(']')) {
                // Handle array/object notation
                const matches = key.match(/(\w+)\[(\d+|\w+)\]\.?(\w+)?/);
                if (matches) {
                    const [, mainKey, index, subKey] = matches;
                    
                    if (!data[mainKey]) data[mainKey] = [];
                    if (subKey) {
                        if (!data[mainKey][index]) data[mainKey][index] = {};
                        data[mainKey][index][subKey] = value;
                    } else {
                        data[mainKey].push(value);
                    }
                }
            } else if (key.includes('.')) {
                // Handle dot notation
                const keys = key.split('.');
                let current = data;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    async publishChanges() {
        const publishBtn = document.getElementById('publish-btn');
        const originalText = publishBtn.innerHTML;
        
        // Show loading state
        publishBtn.disabled = true;
        publishBtn.innerHTML = `
            <span class="flex items-center space-x-2">
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Publishing...</span>
            </span>
        `;

        try {
            const response = await fetch('/admin/api/portfolio/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            // Check if response is ok and contains JSON
            if (!response.ok) {
                if (response.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = '/admin/login';
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                throw new Error('Server returned non-JSON response');
            }

            const result = await response.json();
            
            if (result.success) {
                // Show success message
                this.showMessage('Changes published successfully! The live website has been updated.', 'success');
                
                // Optionally refresh the "View Site" link or notify user
                const viewSiteLink = document.querySelector('a[href="/"]');
                if (viewSiteLink) {
                    // Add a subtle animation to indicate the site was updated
                    viewSiteLink.style.animation = 'pulse 2s';
                    setTimeout(() => {
                        viewSiteLink.style.animation = '';
                    }, 2000);
                }
                
                // Try to refresh any open live site tabs
                this.refreshLiveSite();
            } else {
                this.showMessage('Error publishing changes', 'error');
            }
        } catch (error) {
            console.error('Publish error:', error);
            this.showMessage('Network error while publishing', 'error');
        } finally {
            // Restore button state
            publishBtn.disabled = false;
            publishBtn.innerHTML = originalText;
        }
    }

    refreshLiveSite() {
        // This will attempt to refresh the live site if it's open in another tab
        // Note: This only works for tabs on the same origin due to browser security
        try {
            // Store a timestamp to indicate when changes were published
            localStorage.setItem('lastPublish', Date.now().toString());
            
            // Try to communicate with other tabs (if any)
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('portfolio-updates');
                channel.postMessage({
                    type: 'refresh',
                    timestamp: Date.now()
                });
                channel.close();
            }
        } catch (error) {
            console.log('Could not refresh other tabs:', error);
        }
    }

    async logout() {
        try {
            const response = await fetch('/admin/api/logout', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                window.location.href = result.redirectUrl;
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700';
        
        container.innerHTML = `
            <div class="${bgColor} border px-4 py-3 rounded-lg">
                <div class="flex items-center">
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-gray-400 hover:text-gray-600">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => {
            const messageEl = container.querySelector('div');
            if (messageEl) messageEl.remove();
        }, 5000);
    }
}

// Initialize admin dashboard
const admin = new PortfolioAdmin();