/**
 * Dynamic Resume Data Loader
 * Integrates admin dashboard data with the live resume
 */

class ResumeLoader {
    constructor() {
        this.data = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.updateResume();
    }

    async loadData() {
        try {
            // First check localStorage for admin changes
            const adminData = localStorage.getItem('resumeData');
            if (adminData) {
                this.data = JSON.parse(adminData);
                console.log('✅ Loaded data from admin dashboard');
                return;
            }

            // Fallback to API
            const response = await fetch('/api/portfolio');
            if (response.ok) {
                this.data = await response.json();
                console.log('✅ Loaded data from API');
            } else {
                console.log('⚠️ Using default data structure');
                this.data = this.getDefaultData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = this.getDefaultData();
        }
    }

    updateResume() {
        this.updatePersonalInfo();
        this.updateAboutSection();
        this.updateExperience();
        this.updateSkills();
        this.updateAchievements();
        this.updateContactInfo();
        console.log('🔄 Resume updated with current data');
    }

    updatePersonalInfo() {
        const profile = this.data.profile || {};
        
        // Update hero section
        const nameElements = document.querySelectorAll('.hero-title, h1');
        nameElements.forEach(el => {
            if (el.textContent.includes('Amos Cheruiyot') || el.classList.contains('hero-title')) {
                el.textContent = profile.name || 'Amos Cheruiyot';
            }
        });

        const titleElements = document.querySelectorAll('.hero-subtitle, .professional-title');
        titleElements.forEach(el => {
            if (el.textContent.includes('Technical Support') || el.classList.contains('hero-subtitle')) {
                el.textContent = profile.title || 'Senior Technical Support Specialist & Product Manager';
            }
        });

        const descElements = document.querySelectorAll('.hero-description');
        descElements.forEach(el => {
            if (profile.description) {
                el.textContent = profile.description;
            }
        });

        // Update page title
        if (profile.name) {
            document.title = `${profile.name} - Personal Website`;
        }
    }

    updateAboutSection() {
        const about = this.data.about || {};
        
        // Update about me text
        const aboutTextElements = document.querySelectorAll('#aboutMe, .about-description');
        aboutTextElements.forEach(el => {
            if (about.summary) {
                el.textContent = about.summary;
            }
        });

        // Update detailed description
        const detailElements = document.querySelectorAll('.about-detailed');
        detailElements.forEach(el => {
            if (about.description) {
                el.textContent = about.description;
            }
        });

        // Update education if available
        if (about.education) {
            const degreeElements = document.querySelectorAll('.degree-title');
            degreeElements.forEach(el => {
                el.textContent = about.education.degree || el.textContent;
            });

            const universityElements = document.querySelectorAll('.university-name');
            universityElements.forEach(el => {
                el.textContent = about.education.institution || el.textContent;
            });

            const yearsElements = document.querySelectorAll('.education-years');
            yearsElements.forEach(el => {
                el.textContent = about.education.years || el.textContent;
            });
        }
    }

    updateExperience() {
        const experience = this.data.experience || [];
        
        // Find experience timeline container
        const timelineContainer = document.querySelector('.career-timeline');
        if (!timelineContainer) return;

        // Get existing timeline steps
        const existingSteps = timelineContainer.querySelectorAll('.career-step');
        
        // Update existing steps with new data
        experience.forEach((exp, index) => {
            const step = existingSteps[index];
            if (!step) return;

            // Update job title
            const titleEl = step.querySelector('h3');
            if (titleEl) titleEl.textContent = exp.title || titleEl.textContent;

            // Update company
            const companyEl = step.querySelector('.step-header p');
            if (companyEl && exp.company) {
                companyEl.textContent = exp.company;
            }

            // Update location
            const locationEl = step.querySelector('p[style*="color: #"]');
            if (locationEl && exp.location) {
                locationEl.innerHTML = `📍 ${exp.location}`;
            }

            // Update duration
            const durationEl = step.querySelector('span[style*="background:"]');
            if (durationEl && exp.startDate && exp.endDate) {
                durationEl.textContent = `${exp.startDate} - ${exp.endDate}`;
            }

            // Update achievements
            const achievementsContainer = step.querySelector('.achievements-panel');
            if (achievementsContainer && exp.achievements) {
                const achievementsList = achievementsContainer.querySelector('div[style*="flex-direction: column"]');
                if (achievementsList) {
                    achievementsList.innerHTML = exp.achievements.map(achievement => `
                        <div style="display: flex; align-items: flex-start; gap: 0.5rem;">
                            <div style="width: 6px; height: 6px; background: #${this.getRandomColor()}; border-radius: 50%; margin-top: 0.5rem; flex-shrink: 0;"></div>
                            <p style="color: #450693; font-size: 0.9rem; line-height: 1.4;">${achievement}</p>
                        </div>
                    `).join('');
                }
            }
        });
    }

    updateSkills() {
        const skills = this.data.skills || [];
        
        // Update skills grid
        const skillsGrid = document.querySelector('.skills-grid');
        if (!skillsGrid) return;

        // Clear existing skill tags but keep the structure
        const existingSkills = skillsGrid.querySelectorAll('.skill-tag, span[style*="background:"]');
        
        // Update skill names in existing tags
        skills.forEach((skill, index) => {
            const skillElement = existingSkills[index];
            if (skillElement && skill.name) {
                const iconText = skill.icon ? `${skill.icon} ` : '';
                skillElement.innerHTML = `${iconText}${skill.name}`;
            }
        });

        // Add new skills if there are more skills than existing elements
        if (skills.length > existingSkills.length) {
            for (let i = existingSkills.length; i < skills.length; i++) {
                const skill = skills[i];
                const skillEl = document.createElement('span');
                skillEl.className = 'skill-tag';
                skillEl.style.cssText = 'display: inline-flex; align-items: center; padding: 0.75rem 1.25rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; background: #FF3F7F; color: #ffffff; transition: all 0.3s;';
                skillEl.innerHTML = `${skill.icon || '🛠️'} ${skill.name}`;
                skillsGrid.appendChild(skillEl);
            }
        }
    }

    updateAchievements() {
        const achievements = this.data.achievements || {};
        
        // Update achievement metrics
        if (achievements.customerSatisfaction) {
            const customerSatElements = document.querySelectorAll('[style*="font-size: 3rem"][style*="color: #FF3F7F"]');
            customerSatElements.forEach(el => {
                el.textContent = achievements.customerSatisfaction;
            });
        }

        if (achievements.operationalEfficiency) {
            const efficiencyElements = document.querySelectorAll('[style*="font-size: 3rem"][style*="color: #FFC400"]');
            efficiencyElements.forEach(el => {
                el.textContent = achievements.operationalEfficiency;
            });
        }

        if (achievements.experience) {
            const experienceElements = document.querySelectorAll('[style*="font-size: 3rem"][style*="color: #8C00FF"]');
            experienceElements.forEach(el => {
                el.textContent = achievements.experience;
            });
        }
    }

    updateContactInfo() {
        const profile = this.data.profile || {};
        
        // Update email
        if (profile.email) {
            const emailElements = document.querySelectorAll('[href*="mailto"], .contact-email');
            emailElements.forEach(el => {
                if (el.tagName === 'A') {
                    el.href = `mailto:${profile.email}`;
                }
                if (el.textContent.includes('@') || el.classList.contains('contact-email')) {
                    el.textContent = profile.email;
                }
            });
        }

        // Update phone
        if (profile.phone) {
            const phoneElements = document.querySelectorAll('[href*="tel"], .contact-phone');
            phoneElements.forEach(el => {
                if (el.tagName === 'A') {
                    el.href = `tel:${profile.phone}`;
                }
                if (el.textContent.includes('+') || el.classList.contains('contact-phone')) {
                    el.textContent = profile.phone;
                }
            });
        }

        // Update location
        if (profile.location) {
            const locationElements = document.querySelectorAll('.contact-location');
            locationElements.forEach(el => {
                el.textContent = profile.location;
            });
        }
    }

    getRandomColor() {
        const colors = ['FF3F7F', '8C00FF', 'FFC400', '450693'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getDefaultData() {
        return {
            profile: {
                name: "Amos Cheruiyot",
                title: "Senior Technical Support Specialist & Product Manager",
                email: "amoscheruiyot22@gmail.com",
                phone: "+254 712 255 539",
                location: "Nairobi, Kenya",
                description: "Passionate technology professional with extensive experience in mobile, native and web technologies. Proven track record in developing innovative solutions and managing products in fast-paced Fintech environments."
            },
            about: {
                summary: "Dynamic and results-driven technology professional with 5+ years of proven experience in technical support, product management, and software development within high-growth Fintech environments.",
                description: "Specialized in translating complex technical requirements into user-friendly solutions, with a strong focus on customer experience optimization and cross-functional team collaboration."
            },
            experience: [],
            skills: [],
            achievements: {
                customerSatisfaction: "30%",
                operationalEfficiency: "25%",
                experience: "5+"
            }
        };
    }

    // Method to refresh data (called by admin dashboard)
    async refresh() {
        console.log('🔄 Refreshing resume data...');
        await this.loadData();
        this.updateResume();
    }
}

// Initialize the resume loader
let resumeLoader;

document.addEventListener('DOMContentLoaded', () => {
    resumeLoader = new ResumeLoader();
    
    // Make it globally available for admin dashboard integration
    window.resumeLoader = resumeLoader;
    
    // Listen for BroadcastChannel updates from admin dashboard
    try {
        const channel = new BroadcastChannel('resume-updates');
        channel.addEventListener('message', (event) => {
            if (event.data.type === 'dataUpdate') {
                console.log('📡 Received data update from admin dashboard');
                resumeLoader.data = event.data.data;
                resumeLoader.updateResume();
            }
        });
    } catch (error) {
        console.log('BroadcastChannel not available:', error);
    }
});

// Listen for storage changes (when admin dashboard updates data)
window.addEventListener('storage', (e) => {
    if (e.key === 'resumeData') {
        console.log('📱 Admin data updated, refreshing resume...');
        if (resumeLoader) {
            resumeLoader.refresh();
        }
    }
});

// Listen for custom events from admin dashboard
window.addEventListener('resumeUpdated', () => {
    console.log('📡 Resume update event received');
    if (resumeLoader) {
        resumeLoader.refresh();
    }
});