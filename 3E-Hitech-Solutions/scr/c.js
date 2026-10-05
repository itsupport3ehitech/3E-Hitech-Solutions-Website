/**
 * 3E Hitech Solutions - About Page JavaScript
 * 
 * This file contains all interactive functionality for the website
 * including animations, sliders, and UI interactions.
 */


// Initialize AOS (Animate on Scroll)
function initAOS() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced feature cards interaction
function initFeatureCards() {
    const featureBoxes = document.querySelectorAll('.feature-box');
    
    featureBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        box.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

/**
 * Initialize video background for hero section
 */
function initVideoBackground() {
    const video = document.querySelector('.video-background');
    
    // Check if video exists
    if (!video) return;
    
    // Add a fallback in case video fails to load
    video.addEventListener('error', function() {
        // Replace with fallback image if video fails
        const fallbackImage = document.createElement('img');
        fallbackImage.src = 'src/imgs/about/3Eone.jpg';
        fallbackImage.alt = 'About Hero';
        fallbackImage.className = 'absolute inset-0 z-0 w-full h-full object-cover';
        
        // Replace video with image
        video.parentNode.replaceChild(fallbackImage, video);
    });
    
    // Ensure video plays on mobile devices
    video.play().catch(error => {
        console.log('Auto-play was prevented:', error);
    });
    
    // Add parallax effect on scroll
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (video) {
            // Subtle parallax effect
            video.style.transform = `scale(1.05) translateY(${scrollY * 0.05}px)`;
        }
    });
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAOS();
    initSmoothScroll();
    initFeatureCards();
    initVideoBackground();
});