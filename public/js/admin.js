// Resume Admin Editor JavaScript

// Default experience data
let experienceData = [
    {
        id: 1,
        title: "Tech Excellence Senior Associate",
        company: "Kune Food Lab",
        location: "Nairobi, Kenya",
        duration: "July 2021 - May 2022",
        achievements: [
            "Led cross-departmental customer order escalation resolution, improving customer satisfaction by 30%",
            "Translated complex business requirements into technical specifications using Jira, streamlining development workflows",
            "Architected and managed PoS systems, optimizing menu management and cost tracking processes",
            "Developed comprehensive training materials and automation tools, reducing operational overhead by 25%"
        ]
    },
    {
        id: 2,
        title: "Junior Product Manager",
        company: "SafeBoda",
        location: "Kampala, Uganda",
        duration: "January 2021 - May 2021",
        achievements: [
            "Collaborated with cross-functional development teams to translate customer requirements into actionable product features",
            "Managed complete product lifecycles and defined strategic roadmaps aligned with business objectives",
            "Developed comprehensive strategic vision for feature requests, balancing business and technical requirements",
            "Delivered user-centric solutions and analyzed technical impact on quarterly performance metrics"
        ]
    },
    {
        id: 3,
        title: "Senior Product Support Associate",
        company: "SafeBoda",
        location: "Nairobi, Kenya",
        duration: "March 2019 - April 2021",
        achievements: [
            "Led website maintenance and development initiatives, ensuring optimal performance and user experience",
            "Conducted comprehensive app diagnostics and troubleshooting, resolving critical technical issues efficiently",
            "Spearheaded UI/UX testing initiatives and contributed innovative feature suggestions for product enhancement",
            "Managed high-priority customer escalations and developed anti-fraud strategies as key Fraud team member"
        ]
    }
];

// Initialize admin interface
document.addEventListener('DOMContentLoaded', function() {
    loadExperienceData();
    loadStoredData();
});

// Load experience data into the container
function loadExperienceData() {
    const container = document.getElementById('experienceContainer');
    container.innerHTML = '';
    
    experienceData.forEach(exp => {
        const expElement = createExperienceElement(exp);
        container.appendChild(expElement);
    });
}

// Create experience element
function createExperienceElement(exp) {
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.innerHTML = `
        <div class="experience-header">
            <h3 style="color: #450693; font-size: 1.2rem; margin-bottom: 0.5rem;">Experience ${exp.id}</h3>
            <button class="delete-btn" onclick="deleteExperience(${exp.id})" title="Delete Experience">
                🗑️
            </button>
        </div>
        
        <div class="form-group">
            <label class="form-label">Job Title</label>
            <input type="text" class="form-input" value="${exp.title}" onchange="updateExperience(${exp.id}, 'title', this.value)">
        </div>
        
        <div class="form-group">
            <label class="form-label">Company</label>
            <input type="text" class="form-input" value="${exp.company}" onchange="updateExperience(${exp.id}, 'company', this.value)">
        </div>
        
        <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-input" value="${exp.location}" onchange="updateExperience(${exp.id}, 'location', this.value)">
        </div>
        
        <div class="form-group">
            <label class="form-label">Duration</label>
            <input type="text" class="form-input" value="${exp.duration}" onchange="updateExperience(${exp.id}, 'duration', this.value)">
        </div>
        
        <div class="form-group">
            <label class="form-label">Achievements (one per line)</label>
            <textarea class="form-input form-textarea" onchange="updateExperience(${exp.id}, 'achievements', this.value.split('\\n').filter(a => a.trim()))" style="min-height: 150px;">${exp.achievements.join('\n')}</textarea>
        </div>
    `;
    return div;
}

// Add new experience
function addExperience() {
    const newId = Math.max(...experienceData.map(exp => exp.id)) + 1;
    const newExp = {
        id: newId,
        title: "New Position",
        company: "Company Name",
        location: "City, Country",
        duration: "Start Date - End Date",
        achievements: ["Key achievement or responsibility"]
    };
    
    experienceData.push(newExp);
    loadExperienceData();
    
    // Scroll to new experience
    setTimeout(() => {
        const newElement = document.querySelector(`[onclick="deleteExperience(${newId})"]`).closest('.experience-item');
        newElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Update experience data
function updateExperience(id, field, value) {
    const exp = experienceData.find(e => e.id === id);
    if (exp) {
        exp[field] = value;
    }
}

// Delete experience
function deleteExperience(id) {
    if (confirm('Are you sure you want to delete this experience?')) {
        experienceData = experienceData.filter(exp => exp.id !== id);
        loadExperienceData();
    }
}

// Save all data to localStorage
function saveData() {
    const data = {
        personal: {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            bio: document.getElementById('bio').value
        },
        contact: {
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value
        },
        profile: {
            aboutMe: document.getElementById('aboutMe').value,
            specialization: document.getElementById('specialization').value
        },
        education: {
            degree: document.getElementById('degree').value,
            university: document.getElementById('university').value,
            years: document.getElementById('educationYears').value,
            description: document.getElementById('educationDesc').value
        },
        experience: experienceData,
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s)
    };
    
    localStorage.setItem('resumeData', JSON.stringify(data));
    showNotification('Data saved successfully! 💾', 'success');
}

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem('resumeData');
    if (stored) {
        const data = JSON.parse(stored);
        
        // Load personal info
        document.getElementById('fullName').value = data.personal?.fullName || '';
        document.getElementById('jobTitle').value = data.personal?.jobTitle || '';
        document.getElementById('bio').value = data.personal?.bio || '';
        
        // Load contact info
        document.getElementById('email').value = data.contact?.email || '';
        document.getElementById('phone').value = data.contact?.phone || '';
        document.getElementById('location').value = data.contact?.location || '';
        
        // Load profile
        document.getElementById('aboutMe').value = data.profile?.aboutMe || '';
        document.getElementById('specialization').value = data.profile?.specialization || '';
        
        // Load education
        document.getElementById('degree').value = data.education?.degree || '';
        document.getElementById('university').value = data.education?.university || '';
        document.getElementById('educationYears').value = data.education?.years || '';
        document.getElementById('educationDesc').value = data.education?.description || '';
        
        // Load experience
        if (data.experience) {
            experienceData = data.experience;
            loadExperienceData();
        }
        
        // Load skills
        if (data.skills) {
            document.getElementById('skills').value = data.skills.join(', ');
        }
        
        showNotification('Data loaded successfully! 🔄', 'success');
    } else {
        showNotification('No saved data found', 'info');
    }
}

// Load stored data on page load
function loadStoredData() {
    const stored = localStorage.getItem('resumeData');
    if (stored) {
        loadData();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    `;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#10B981';
            break;
        case 'error':
            notification.style.background = '#EF4444';
            break;
        case 'info':
        default:
            notification.style.background = '#8C00FF';
            break;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Auto-save functionality
let autoSaveTimeout;
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveData();
        console.log('Auto-saved at:', new Date().toLocaleTimeString());
    }, 2000); // Auto-save 2 seconds after last change
}

// Add auto-save to all inputs
document.addEventListener('input', function(e) {
    if (e.target.matches('.form-input')) {
        autoSave();
    }
});

// Export data as JSON
function exportData() {
    const data = JSON.parse(localStorage.getItem('resumeData') || '{}');
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'resume-data.json';
    link.click();
    
    showNotification('Data exported successfully! 📥', 'success');
}

// Import data from JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('resumeData', JSON.stringify(data));
            loadData();
            showNotification('Data imported successfully! 📤', 'success');
        } catch (error) {
            showNotification('Error importing data: Invalid JSON file', 'error');
        }
    };
    reader.readAsText(file);
}