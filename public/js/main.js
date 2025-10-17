// Main JavaScript file for personal website

// Load portfolio data from API
async function loadPortfolioData() {
    try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        
        // Update profile information
        updateProfile(data.profile);
        
        // Update about section
        updateAbout(data.about);
        
        // Update skills
        updateSkills(data.skills);
        
        // Update achievements
        updateAchievements(data.achievements);
        
        // Update experience
        updateExperience(data.experience);
        
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

// Update profile section
function updateProfile(profile) {
    if (!profile) return;
    
    const nameElement = document.querySelector('h1 span');
    const titleElement = document.querySelector('p.text-xl.text-gray-300');
    const emailElement = document.querySelector('[href^="mailto:"]');
    const phoneElement = document.querySelector('[href^="tel:"]');
    
    if (nameElement) nameElement.textContent = profile.name || 'Amos Cheruiyot';
    if (titleElement) titleElement.textContent = profile.title || 'Software Developer';
    if (emailElement) {
        emailElement.href = `mailto:${profile.email}`;
        emailElement.textContent = profile.email;
    }
    if (phoneElement) {
        phoneElement.href = `tel:${profile.phone}`;
        phoneElement.textContent = profile.phone;
    }
}

// Update about section
function updateAbout(about) {
    if (!about) return;
    
    const summaryElement = document.querySelector('#about p.text-lg');
    const descriptionElement = document.querySelector('#about p.text-gray-300');
    
    if (summaryElement) summaryElement.textContent = about.summary || about;
    if (descriptionElement && about.description) {
        descriptionElement.textContent = about.description;
    }
}

// Update skills section
function updateSkills(skills) {
    if (!skills || !Array.isArray(skills)) return;
    
    const skillsContainer = document.querySelector('#skills .grid');
    if (!skillsContainer) return;
    
    skillsContainer.innerHTML = '';
    
    skills.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-tag bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-center';
        skillElement.innerHTML = `
            <span class="text-2xl">${skill.icon || '🔧'}</span>
            <span class="ml-2 font-semibold">${skill.name}</span>
        `;
        skillsContainer.appendChild(skillElement);
    });
}

// Update achievements section
function updateAchievements(achievements) {
    if (!achievements) return;
    
    const achievementsContainer = document.querySelector('#achievements .grid');
    if (!achievementsContainer) return;
    
    achievementsContainer.innerHTML = '';
    
    const achievementsList = [
        { number: achievements.experience || '5+', description: 'Years Experience' },
        { number: achievements.customerSatisfaction || '30%', description: 'Customer Satisfaction Increase' },
        { number: achievements.operationalEfficiency || '25%', description: 'Operational Efficiency Improvement' }
    ];
    
    achievementsList.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'card-hover bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center transition-all duration-300';
        achievementElement.innerHTML = `
            <div class="text-4xl font-bold text-accent mb-2">${achievement.number}</div>
            <div class="text-gray-300">${achievement.description}</div>
        `;
        achievementsContainer.appendChild(achievementElement);
    });
}

// Update experience section
function updateExperience(experiences) {
    if (!experiences || !Array.isArray(experiences)) return;
    
    const experienceContainer = document.querySelector('#experience .space-y-8');
    if (!experienceContainer) return;
    
    experienceContainer.innerHTML = '';
    
    experiences.forEach(exp => {
        const expElement = document.createElement('div');
        expElement.className = 'card-hover bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 relative border-l-4 border-accent';
        expElement.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                    <h3 class="text-2xl font-bold text-white mb-2">${exp.title}</h3>
                    <p class="text-accent font-semibold mb-1">${exp.company}</p>
                    <p class="text-gray-400 text-sm">${exp.location || ''}</p>
                </div>
                <div class="mt-2 md:mt-0">
                    <span class="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium">
                        ${exp.startDate} - ${exp.endDate || 'Present'}
                    </span>
                </div>
            </div>
            <div class="text-gray-300 space-y-2">
                ${exp.achievements ? exp.achievements.map(achievement => `
                    <p class="flex items-start">
                        <span class="text-accent mr-2 mt-1">▶</span>
                        <span>${achievement}</span>
                    </p>
                `).join('') : ''}
            </div>
        `;
        experienceContainer.appendChild(expElement);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadPortfolioData();
    initNavigation();
    initScrollAnimations();
    initMobileMenu();
    addParallaxEffect();
    addSkillAnimations();
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active navigation link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observe sections for animations
    const animatedElements = document.querySelectorAll('section, .card-hover');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.hidden.md\:flex');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
        });
    }
}

// Parallax effect
function addParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.absolute.top-1\\/4, .absolute.top-1\\/3, .absolute.bottom-1\\/4');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.3 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Skill animations
function addSkillAnimations() {
    const skillTags = document.querySelectorAll('.skill-tag');
    
    // Add staggered animation delays
    skillTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.1}s`;
        
        // Add hover effects
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Add typing effect to the main title
function addTypingEffect() {
    const title = document.querySelector('h1 span');
    if (title) {
        const text = title.textContent;
        title.textContent = '';
        title.style.borderRight = '2px solid #7c3aed';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                // Remove cursor after typing is done
                setTimeout(() => {
                    title.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
}

// Initialize typing effect after page load
window.addEventListener('load', () => {
    setTimeout(addTypingEffect, 500);
});
