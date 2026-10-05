/**
 * 3EHitech Solutions - Scroll Management JS
 * 
 * Contains all scroll-related functionality including:
 * - Back to Top Button
 * - Smooth scrolling for anchor links
 * - Scroll based animations and effects
 * 
 */

// Back To Top Button Functionalities
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');

    if (!backToTopBtn) return;

    // Hide/Show button
    function toggleBackToTopButton() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('opacity-0', 'invisible');
            backToTopBtn.classList.add('opacity-100', 'visible');
        } else {
            backToTopBtn.classList.add('opacity-0', 'invisible');
            backToTopBtn.classList.remove('opacity-100', 'visible');
        }
    }

    // Smooth scroll to top
    function scrollToTop() {
        window.scrollTo ({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Event listeners
    window.addEventListener('scroll', toggleBackToTopButton);
    backToTopBtn.addEventListener('click', scrollToTop);

    // Initial check
    toggleBackToTopButton();
}

// Smooth Srolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header-container')?.offsetHeight || 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { treshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el)); 
}

// Inject styles for back to top button
function injectBackToTopStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #back-to-top {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #0056b3;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            z-index: 1000;
        }
        #back-to-top:hover { background: #00a0e9; }
        @media (min-width: 641px) {
            #back-to-top {
                bottom: 1.5rem;
            }
        }
         @media (max-width: 640px) {
            #back-to-top {
                bottom: 1rem;
            }
        }
        .opacity-0 { opacity: 0 }
        .opacity-100 { opacity: 1 }
        .invisible { visibility: hidden }
        .visible { visibility: visible }
        `;
        document.head.appendChild(style);
}

// Initialization
function initScrollFeatures() {
    initBackToTop();
    initSmoothScroll();
    initScrollAnimations();
    injectBackToTopStyles();
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initScrollFeatures);

// Export for manual initialization
window.ScrollManager = {
    initBackToTop,
    initSmoothScroll,
    initScrollAnimations,
    initAll: initScrollFeatures
};