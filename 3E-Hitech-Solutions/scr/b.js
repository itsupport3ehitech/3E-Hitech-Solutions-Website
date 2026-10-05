/**
 * 3E Hitech Solutions - Solutions Page JavaScript
 * 
 * This file contains all interactive functionality for the website
 * including animations, sliders, and UI interactions.
 */

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header-container').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (!mobileMenu.classList.contains('hidden')) {
                    document.getElementById('mobile-menu-button').click();
                }
            }
        });
    });
}

// Animate elements on scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.solution-category-card, .solution-detail-card, .solution-image-wrapper, .feature-item, .power-solutions-hero');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach((el, index) => {
        el.setAttribute('data-aos', 'fade-up');
        el.setAttribute('data-aos-delay', (index % 4) * 100);
        observer.observe(el);
    });
    
    // Special animation for power solutions hero
    const powerHero = document.querySelector('.power-solutions-hero');
    if (powerHero) {
        powerHero.setAttribute('data-aos', 'zoom-in');
        powerHero.setAttribute('data-aos-duration', '800');
    }
}

// Counter Animation
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Add interactive hover effects
function initInteractiveEffects() {
    // Add tilt effect to solution cards
    const cards = document.querySelectorAll('.solution-category-card, .solution-detail-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
    
    // Add magnetic effect to CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0px, 0px) scale(1)';
        });
    });
}

// Footer animations and interactions
function initFooter() {
    // Add hover effect to social icons
    const socialIcons = document.querySelectorAll('.footer-social');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            const i = icon.querySelector('i');
            if (i) i.classList.add('animate-pulse');
        });
        icon.addEventListener('mouseleave', () => {
            const i = icon.querySelector('i');
            if (i) i.classList.remove('animate-pulse');
        });
    });

    // Animate footer links on scroll
    const footerCols = document.querySelectorAll('.footer-col');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const links = entry.target.querySelectorAll('li');
                links.forEach((link, index) => {
                    setTimeout(() => {
                        link.style.opacity = '1';
                        link.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    footerCols.forEach(col => {
        const links = col.querySelectorAll('li');
        links.forEach(link => {
            link.style.opacity = '0';
            link.style.transform = 'translateY(20px)';
            link.style.transition = 'all 0.5s ease';
        });
        observer.observe(col);
    });
}

// Initialize video background
function initVideoBackground() {
    const videoElement = document.querySelector('.video-background video');
    
    if (videoElement) {
        // Ensure video plays
        videoElement.play().catch(error => {
            console.log('Auto-play was prevented. User interaction required.');
            
            // Add a play button for mobile devices that block autoplay
            if (error.name === 'NotAllowedError') {
                const playButton = document.createElement('button');
                playButton.className = 'absolute inset-0 w-full h-full bg-black/50 flex items-center justify-center z-20';
                playButton.innerHTML = '<i class="ri-play-circle-fill text-6xl text-white/80 hover:text-white transition-colors"></i>';
                
                playButton.addEventListener('click', () => {
                    videoElement.play();
                    playButton.remove();
                });
                
                videoElement.parentNode.appendChild(playButton);
            }
        });
        
        // Handle responsive behavior for video
        function handleVideoResize() {
            if (window.innerWidth < 768) {
                videoElement.setAttribute('playsinline', '');
                videoElement.setAttribute('muted', '');
                videoElement.muted = true;
            }
        }
        
        // Call once on init and add resize listener
        handleVideoResize();
        window.addEventListener('resize', handleVideoResize);
    }
}


// Initialize all functions on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initScrollAnimations();
    initCounterAnimation();
    initInteractiveEffects();
    initVideoBackground();
    initFooter();
});