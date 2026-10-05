/**
 * 3E Hitech Solutions - Home Page JavaScript
 * 
 * This file contains all interactive functionality for the website
 * including animations, sliders, and UI interactions.
 */

// UTILITY FUNCTIONS

/**
 * Creates an Intersection Observer to animate elements on scroll
 * @param {string} selector - CSS selector for elements to observe
 * @param {Function} callback - Function to run when element is visible
 * @param {Object} options - Observer options
 */
function createScrollObserver(selector, callback, options = { threshold: 0.2 }) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    elements.forEach(element => observer.observe(element));
}

// ======================================================
// COMPONENT INITIALIZERS
// ======================================================

/**
 * Initialize hero section animations
 */
function initHeroAnimations() {
    const heroSection = document.querySelector('.hero-section');
    const heroContent = document.querySelector('.hero-content');
    const heroShapes = document.querySelectorAll('.hero-shape');
    const heroIcons = document.querySelectorAll('.hero-icon');
    
    if (heroSection && heroContent) {
        // Initialize 3D effect
        heroSection.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Enhanced 3D movement for content
            heroContent.style.transform = `translateX(${x * -15}px) translateY(${y * -15}px) rotateY(${x * 3}deg) rotateX(${y * -3}deg)`;
            
            // Move background shapes with different factors for depth
            heroShapes.forEach((shape, index) => {
                const factor = (index + 1) * 8;
                const rotationFactor = (index + 1) * 2;
                shape.style.transform = `translateX(${x * factor}px) translateY(${y * factor}px) rotate(${x * rotationFactor}deg)`;
            });
            
            // Animate icons if they exist
            heroIcons.forEach((icon, index) => {
                const factor = (index + 1) * 3;
                icon.style.transform = `translateX(${x * factor * 2}px) translateY(${y * factor * 2}px) scale(${1 + (x + y) * 0.1})`;
            });
        });
        
        // Add pulse effect to shapes
        heroShapes.forEach((shape, index) => {
            shape.style.animationDelay = `${index * 0.5}s`;
        });
        

    }
    
    // Handle gradient text interactions
    const gradientText = document.querySelector('.hero-title .gradient-text');
    if (gradientText) {
        // Store animation state
        let isAnimating = true;
        
        // Handle click event
        gradientText.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle animation state
            isAnimating = !isAnimating;
            
            if (isAnimating) {
                gradientText.classList.remove('paused');
                gradientText.style.backgroundPosition = '';
            } else {
                gradientText.classList.add('paused');
                // Capture current position to prevent jump
                const computedStyle = window.getComputedStyle(gradientText);
                gradientText.style.backgroundPosition = computedStyle.backgroundPosition;
            }
        });
        
        // Ensure animation continues properly after hover
        gradientText.addEventListener('mouseenter', () => {
            if (isAnimating) {
                // Briefly pause to prevent flicker
                gradientText.classList.add('paused');
                setTimeout(() => {
                    gradientText.classList.remove('paused');
                }, 50);
            }
        });
    }
    

}

/**
 * Initialize particles.js for hero section
 */
function initParticles() {
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 100, density: { enable: true, value_area: 800 } },
                color: { value: ['#ffffff', '#00a0e9', '#0056b3'] },
                shape: { 
                    type: ['circle', 'triangle', 'polygon'],
                    polygon: { nb_sides: 6 }
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
                },
                size: {
                    value: 4,
                    random: true,
                    anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00a0e9',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: { enable: true, rotateX: 600, rotateY: 1200 }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 180, line_linked: { opacity: 0.8 } },
                    push: { particles_nb: 6 },
                    remove: { particles_nb: 2 }
                }
            },
            retina_detect: true
        });
    }
    
    // Initialize counter animations
    initCounters();
}

/**
 * Initialize counter animations for stats
 */
function initCounters() {
    const counterElements = document.querySelectorAll('.counter-value');
    
    counterElements.forEach(counter => {
        const target = parseInt(counter.textContent);
        let count = 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 30); // Update every 30ms
        
        function updateCount() {
            if (count < target) {
                count += increment;
                counter.textContent = Math.ceil(count);
                setTimeout(updateCount, 30);
            } else {
                counter.textContent = target;
            }
        }
        
        // Start counter when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

/**
 * Initialize solutions section
 */
function initSolutionsSection() {
    // Solutions data
    const solutions = [
        {
            id: 'power',
            title: 'POWER',
            icon: 'ri-flashlight-line',
            image: '../src/imgs/main/photo1.jpg',
            description: 'Comprehensive power infrastructure solutions for reliable energy systems.',
            features: [
                { text: 'ICT Equipment', icon: 'ri-server-line' },
                { text: 'MW Radio', icon: 'ri-broadcast-line' },
                { text: 'Optical Grounding Wire', icon: 'ri-pulse-line' },
                { text: 'Battery & Rectifier', icon: 'ri-battery-2-charge-line' },
                { text: 'Security (Firewall)', icon: 'ri-shield-check-line' },
                { text: 'Maintenance', icon: 'ri-tools-line' }
            ]
        },
        {
            id: 'ftth',
            title: 'FTTH - GPON',
            icon: 'ri-base-station-line',
            image: '../src/imgs/main/photo2.jpg',
            description: 'Fiber to the Home solutions with Gigabit Passive Optical Network technology.',
            features: [
                { text: 'OLT Installation', icon: 'ri-router-line' },
                { text: 'Fiber Distribution', icon: 'ri-git-branch-line' },
                { text: 'ONT Configuration', icon: 'ri-settings-line' },
                { text: 'Network Testing', icon: 'ri-speed-line' },
                { text: 'Maintenance Services', icon: 'ri-tools-line' },
                { text: '24/7 Support', icon: 'ri-customer-service-2-line' }
            ]
        },
        {
            id: 'fiber',
            title: 'FIBER - FOC',
            icon: 'ri-wifi-line',
            image: '../src/imgs/main/photo3.jpg',
            description: 'Fiber Optic Cable solutions for high-speed data transmission networks.',
            features: [
                { text: 'Cable Installation', icon: 'ri-install-line' },
                { text: 'Splicing Services', icon: 'ri-scissors-cut-line' },
                { text: 'Network Design', icon: 'ri-layout-line' },
                { text: 'Testing & Certification', icon: 'ri-test-tube-line' },
                { text: 'Maintenance & Repair', icon: 'ri-tools-fill' },
                { text: 'Consulting', icon: 'ri-lightbulb-line' }
            ]
        },
        {
            id: 'security',
            title: 'Security - CCTV',
            icon: 'ri-cctv-line',
            image: '../src/imgs/main/photo4.jpg',
            description: 'Comprehensive security solutions with advanced CCTV surveillance systems.',
            features: [
                { text: 'Camera Installation', icon: 'ri-camera-line' },
                { text: 'Video Management', icon: 'ri-video-line' },
                { text: 'Remote Monitoring', icon: 'ri-remote-control-line' },
                { text: 'Access Control', icon: 'ri-door-lock-line' },
                { text: '24/7 Support', icon: 'ri-customer-service-2-line' },
                { text: 'Data Security', icon: 'ri-shield-keyhole-line' }
            ]
        }
    ];

    const solutionsSection = document.querySelector('#home-services');
    if (!solutionsSection) return;
    
    // Get container for solutions
    const container = solutionsSection.querySelector('.container');
    if (!container) return;
    
    // Remove existing content if any
    const oldSlideshow = container.querySelector('.services-slideshow');
    const oldFeatures = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    const oldTabs = container.querySelector('.solution-tabs');
    const oldContents = container.querySelector('.solution-contents');
    
    if (oldSlideshow) oldSlideshow.remove();
    if (oldFeatures) oldFeatures.remove();
    if (oldTabs) oldTabs.remove();
    if (oldContents) oldContents.remove();
    
    // Create tabs container with enhanced styling
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'solution-tabs flex justify-center items-center mb-10 relative';
    
    // Add decorative elements to tabs
    const tabsDecorLeft = document.createElement('div');
    tabsDecorLeft.className = 'hidden md:block absolute left-0 h-0.5 bg-gradient-to-r from-transparent to-primary/20 w-1/6';
    tabsContainer.appendChild(tabsDecorLeft);
    
    const tabsDecorRight = document.createElement('div');
    tabsDecorRight.className = 'hidden md:block absolute right-0 h-0.5 bg-gradient-to-l from-transparent to-primary/20 w-1/6';
    tabsContainer.appendChild(tabsDecorRight);
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'solution-contents relative';
    
    // Insert after the title section
    const titleSection = container.querySelector('.text-center.mb-16');
    if (titleSection) {
        titleSection.insertAdjacentElement('afterend', tabsContainer);
        tabsContainer.insertAdjacentElement('afterend', contentContainer);
    }
    
    // Create tabs and content
    solutions.forEach((solution, index) => {
        // Create tab with icon and text
        const tab = document.createElement('div');
        tab.className = `solution-tab ${index === 0 ? 'active' : ''}`;
        tab.setAttribute('data-tab', solution.id);
        tab.innerHTML = `
            <div class="tab-icon"><i class="${solution.icon}"></i></div>
            <span>${solution.title}</span>
        `;
        tab.addEventListener('click', () => activateTab(solution.id));
        tabsContainer.appendChild(tab);
        
        // Create content with enhanced layout
        const content = document.createElement('div');
        content.className = `solution-content ${index === 0 ? 'active' : ''}`;
        content.setAttribute('id', `content-${solution.id}`);
        
        content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    <div class="solution-card h-full p-8">
                        <div class="solution-image-container mb-6 overflow-hidden rounded-xl relative">
                            <img src="${solution.image}" alt="${solution.title} Solution" class="w-full object-cover transition-transform duration-700 hover:scale-110">
                            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                <i class="${solution.icon} text-primary"></i>
                                <span class="font-semibold text-primary text-sm">${solution.title}</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-4 mb-4">
                            <div class="solution-icon">
                                <i class="${solution.icon}"></i>
                            </div>
                            <h3 class="solution-title text-2xl">${solution.title}</h3>
                        </div>
                        
                        <p class="solution-description mb-6">${solution.description}</p>
                        
                        <h4 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <span class="w-6 h-1 bg-primary rounded-full"></span>
                            Key Features
                        </h4>
                        
                        <div class="solution-features">
                            ${solution.features.map(feature => `
                                <div class="solution-feature-item">
                                    <div class="solution-feature-icon">
                                        <i class="${feature.icon}"></i>
                                    </div>
                                    <span class="solution-feature-text">${feature.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div>
                    <div class="solution-highlight h-full flex flex-col">
                        <div class="solution-highlight-image-container relative">
                            <img src="${solution.image}" alt="${solution.title} Solution" class="w-full object-cover transition-transform duration-700 hover:scale-110">
                            <div class="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-blue-900/30"></div>
                            <div class="absolute bottom-0 left-0 w-full p-4">
                                <div class="flex items-center gap-2 text-white">
                                    <i class="${solution.icon} text-xl"></i>
                                    <span class="font-bold">${solution.title}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-6">
                            <h3 class="solution-highlight-title">Why Choose Our ${solution.title} Solutions?</h3>
                            <p class="solution-highlight-description">We provide industry-leading ${solution.title} solutions with expert installation, maintenance, and support services.</p>
                            
                            <ul class="mt-4 space-y-2 mb-6">
                                <li class="flex items-center gap-2 text-white/90">
                                    <i class="ri-check-line text-white/80"></i>
                                    <span>Professional Installation</span>
                                </li>
                                <li class="flex items-center gap-2 text-white/90">
                                    <i class="ri-check-line text-white/80"></i>
                                    <span>24/7 Technical Support</span>
                                </li>
                                <li class="flex items-center gap-2 text-white/90">
                                    <i class="ri-check-line text-white/80"></i>
                                    <span>Quality Assurance</span>
                                </li>
                            </ul>
                            

                        </div>
                    </div>
                </div>
            </div>
        `;
        
        contentContainer.appendChild(content);
    });
    
    // Update CTA button with enhanced styling
    const ctaContainer = container.querySelector('.text-center:last-child');
    if (ctaContainer) {
        const ctaLink = ctaContainer.querySelector('a');
        if (ctaLink) {
            ctaLink.setAttribute('href', 'ps/solutions.html');
            ctaLink.classList.add('shadow-lg', 'hover:shadow-xl', 'transition-all', 'duration-500');
            
            // Add click handler to ensure navigation works
            ctaLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'ps/solutions.html';
            });
            
            const ctaSpan = ctaLink.querySelector('span');
            if (ctaSpan) ctaSpan.textContent = 'Explore All Solutions';
            
            // Add pulse effect to button
            const pulseEffect = document.createElement('div');
            pulseEffect.className = 'absolute inset-0 rounded-full animate-ping bg-primary/20 z-0';
            pulseEffect.style.animationDuration = '3s';
            ctaLink.appendChild(pulseEffect);
        }
    }
    
    // Enhanced tab activation function with smooth transitions
    function activateTab(tabId) {
        // First hide all content with fade out
        document.querySelectorAll('.solution-content.active').forEach(content => {
            content.style.opacity = '0';
            content.style.transform = 'translateY(10px)';
        });
        
        // Update tabs
        document.querySelectorAll('.solution-tab').forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabId;
            tab.classList.toggle('active', isActive);
            
            // Add subtle animation to tabs
            if (isActive) {
                tab.style.transform = 'translateY(-3px)';
                setTimeout(() => {
                    tab.style.transform = 'translateY(0)';
                }, 300);
            }
        });
        
        // Update content with delay for smooth transition
        setTimeout(() => {
            document.querySelectorAll('.solution-content').forEach(content => {
                const isActive = content.getAttribute('id') === `content-${tabId}`;
                content.classList.toggle('active', isActive);
                
                if (isActive) {
                    setTimeout(() => {
                        content.style.opacity = '1';
                        content.style.transform = 'translateY(0)';
                    }, 50);
                }
            });
        }, 300);
    }
    
    // Add enhanced animations on scroll
    createScrollObserver('.solution-card', (card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.98)';
        card.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 200);
    });
    
    createScrollObserver('.solution-highlight', (highlight) => {
        highlight.style.opacity = '0';
        highlight.style.transform = 'translateY(30px) scale(0.98)';
        highlight.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s';
        
        setTimeout(() => {
            highlight.style.opacity = '1';
            highlight.style.transform = 'translateY(0) scale(1)';
        }, 300);
    });
    
    // Add staggered animation to feature items
    createScrollObserver('.solution-features', (featureContainer) => {
        const features = featureContainer.querySelectorAll('.solution-feature-item');
        
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(20px)';
            feature.style.transition = `all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s`;
            
            setTimeout(() => {
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 300 + (index * 100));
        });
    });
}

/**
 * Initialize projects showcase
 */
function initProjectsShowcase() {
    const regionNavItems = document.querySelectorAll('.project-nav-item');
    const regionCards = document.querySelectorAll('.region-card');
    const regionMarkers = document.querySelectorAll('.region-marker');
    
    if (!regionNavItems.length && !regionCards.length && !regionMarkers.length) return;
    
    // Function to activate a region
    function activateRegion(regionId) {
        regionNavItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-region') === regionId);
        });
        
        regionCards.forEach(card => {
            card.classList.toggle('active', card.getAttribute('data-region') === regionId);
        });
        
        regionMarkers.forEach(marker => {
            marker.classList.toggle('active', marker.getAttribute('data-region') === regionId);
        });
    }
    
    // Add event listeners
    regionNavItems.forEach(item => {
        item.addEventListener('click', () => {
            activateRegion(item.getAttribute('data-region'));
        });
    });
    
    regionMarkers.forEach(marker => {
        marker.addEventListener('click', () => {
            activateRegion(marker.getAttribute('data-region'));
        });
    });
    
    // Initialize first region
    if (regionNavItems.length > 0) {
        activateRegion(regionNavItems[0].getAttribute('data-region'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initHeroAnimations();
    initParticles();
    initSolutionsSection();
    initFooter();
});
