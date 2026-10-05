/**
 * Footer JavaScript with inline CSS styles and HTML generation
 */

// CSS styles
function injectFooterStyles() {
    // Check if styles already exist
    if (document.getElementById('footer-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'footer-styles';
    style.textContent = `
        .footer-bg {
            background-color: #111827;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .footer-logo {
            padding: 0.75rem;
            display: inline-block;
        }

        .footer-logo img {
            width: auto;
            height: 48px;
            max-height: 60px;
            object-fit: contain;
        }
        
        @media (max-width: 640px) {
            .footer-logo {
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .footer-logo img {
                height: 32px;
                max-height: 40px;
            }
        }

        @media (min-width: 768px) {
             .footer-logo {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .footer-logo img {
                height: 50px;
                max-height: 72px;
            }
        }

        .footer-social {
            position: relative;
            transition: all 0.3s ease;
        }

        .footer-social:hover {
            transform: translateY(-5px);
        }

        .footer-social:hover > div {
            box-shadow: 0 0 15px rgba(0, 86, 179, 0.4);
        }

        .footer-col h3 {
            display: inline-block;
            position: relative;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
        }

        .footer-link {
            display: flex;
            align-items: center;
            color: #9ca3af;
            transition: all 0.3s ease;
            padding: 0.25rem 0;
        }

        .footer-link:hover {
            color: white;
            transform: translateX(3px);
        }

        .footer-link i {
            color: #0056b3;
            transition: all 0.3s ease;
        }

        @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
        }

        #footer-grid path {
            stroke-dasharray: 40;
            stroke-dashoffset: 80;
            animation: dash 15s linear infinite;
        }

        @keyframes dash {
            to { stroke-dashoffset: 0; }
        }
    `;
    document.head.appendChild(style);
}

// footer HTML
function createFooter() {
    // Check if footer already exists
    if (document.querySelector('.footer-bg')) return;
    
    // Handles page detection
    const isInSubfolder = window.location.pathname.includes('/ps/');
    const logoPath = isInSubfolder ? '../src/imgs/logo/logo.png' : 'src/imgs/logo/logo.png'; 
    const footer = document.createElement('footer');
    footer.className = 'footer-bg relative overflow-hidden';
    footer.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-0"></div>
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-400 to-primary"></div>
        
        <div class="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="footer-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0 20 L40 20 M20 0 L20 40" stroke="#ffffff" stroke-width="0.5"></path>
                </pattern>
                <rect width="100%" height="100%" fill="url(#footer-grid)"></rect>
            </svg>
        </div>
        
        <div class="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 relative z-10">

            <div class="flex flex-col items-center mb-8 sm:mb-10 md:mb-12">
                <div class="footer-logo mb-6 flex items-center justify-center gap-3">
                    <img src="${logoPath}" alt="3E Hitech Solutions Inc. Logo" class="h-6 sm:h-8 md:h-10 object-contain">
                    <h2 class="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent text-center">3E Hitech Solutions</h2>
                </div>

                <p class="text-gray-400 max-w-xs sm:max-w-md md:max-w-xl text-center mb-6 sm:mb-8 text-sm sm:text-base">Leading provider of integrated solutions for power grid and telecom networks in the Philippines since 2016.</p>
                <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <a href="#" class="footer-social group">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm rounded-full text-white group-hover:bg-primary transition-all duration-300 relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-tr from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <i class="ri-facebook-fill text-lg sm:text-xl relative z-10"></i>
                        </div>
                    </a>
                    <a href="#" class="footer-social group">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm rounded-full text-white group-hover:bg-primary transition-all duration-300 relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-tr from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <i class="ri-linkedin-fill text-lg sm:text-xl relative z-10"></i>
                        </div>
                    </a>
                    <a href="#" class="footer-social group">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm rounded-full text-white group-hover:bg-primary transition-all duration-300 relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-tr from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <i class="ri-twitter-x-fill text-lg sm:text-xl relative z-10"></i>
                        </div>
                    </a>
                    <a href="#" class="footer-social group">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm rounded-full text-white group-hover:bg-primary transition-all duration-300 relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-tr from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <i class="ri-instagram-fill text-lg sm:text-xl relative z-10"></i>
                        </div>
                    </a>
                </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10 md:mb-12">
                <div class="footer-col">
                    <h3 class="text-base sm:text-lg font-bold mb-4 sm:mb-6 relative inline-block">
                        <span class="relative z-10">Quick Links</span>
                        <div class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-blue-400 rounded-full"></div>
                    </h3>
                    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <li><a href="index.html" class="footer-link group text-sm sm:text-base"><i class="ri-arrow-right-s-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>Home</a></li>
                        <li><a href="ps/solutions.html" class="footer-link group text-sm sm:text-base"><i class="ri-arrow-right-s-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>Solutions</a></li>
                        <li><a href="ps/about.html" class="footer-link group text-sm sm:text-base"><i class="ri-arrow-right-s-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>About Us</a></li>
                        <li><a href="ps/contact.html" class="footer-link group text-sm sm:text-base"><i class="ri-arrow-right-s-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>Contact</a></li>
                    </ul>
                </div>
                
                <div class="footer-col">
                    <h3 class="text-base sm:text-lg font-bold mb-4 sm:mb-6 relative inline-block">
                        <span class="relative z-10">Our Solutions</span>
                        <div class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-blue-400 rounded-full"></div>
                    </h3>
                    <ul class="space-y-2 sm:space-y-3">
                        <li><a href="ps/solutions.html#power" class="footer-link group text-sm sm:text-base"><i class="ri-check-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>Power Solutions</a></li>
                        <li><a href="ps/solutions.html#ftth" class="footer-link group text-sm sm:text-base"><i class="ri-check-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>FTTH - GPON</a></li>
                        <li><a href="ps/solutions.html#fiber" class="footer-link group text-sm sm:text-base"><i class="ri-check-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>Fiber - FOC</a></li>
                        <li><a href="ps/solutions.html#security" class="footer-link group text-sm sm:text-base"><i class="ri-check-line mr-2 text-primary group-hover:translate-x-1 transition-transform duration-300"></i>Security - CCTV</a></li>
                    </ul>
                </div>
                
                <div class="footer-col sm:col-span-2 lg:col-span-1">
                    <h3 class="text-base sm:text-lg font-bold mb-4 sm:mb-6 relative inline-block">
                        <span class="relative z-10">Contact Us</span>
                        <div class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-blue-400 rounded-full"></div>
                    </h3>
                    <ul class="space-y-3 sm:space-y-4">
                        <li class="flex items-start group">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800/80 rounded-full text-primary mr-3 sm:mr-4 mt-1 group-hover:bg-primary/10 transition-colors duration-300 flex-shrink-0">
                                <i class="ri-map-pin-line text-sm sm:text-lg"></i>
                            </div>
                            <div>
                                <h4 class="text-white text-xs sm:text-sm font-medium mb-1">Our Location</h4>
                                <span class="text-gray-400 text-xs sm:text-sm block">• Office: H26C+HGR, Sen. Gil J. Puyat Ave, Makati City</span>
                                <span class="text-gray-400 text-xs sm:text-sm block">• Business: 33 Ortigas, Pasay City</span>
                            </div>
                        </li>
                        <li class="flex items-start group">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800/80 rounded-full text-primary mr-3 sm:mr-4 mt-1 group-hover:bg-primary/10 transition-colors duration-300 flex-shrink-0">
                                <i class="ri-phone-line text-sm sm:text-lg"></i>
                            </div>
                            <div>
                                <h4 class="text-white text-xs sm:text-sm font-medium mb-1">Call Us</h4>
                                <span class="text-gray-400 text-xs sm:text-sm">+63998-587-5995</span>
                            </div>
                        </li>
                        <li class="flex items-start group">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800/80 rounded-full text-primary mr-3 sm:mr-4 mt-1 group-hover:bg-primary/10 transition-colors duration-300 flex-shrink-0">
                                <i class="ri-time-line text-sm sm:text-lg"></i>
                            </div>
                            <div>
                                <h4 class="text-white text-xs sm:text-sm font-medium mb-1">Business Hours</h4>
                                <span class="text-gray-400 text-xs sm:text-sm">Monday - Friday: 8:30 AM - 5:30 PM</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="pt-6 sm:pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p class="text-gray-400 text-xs sm:text-sm text-center sm:text-left">&copy; 2025 <span class="text-primary">3E Hitech Solutions Inc.</span> All rights reserved.</p>
                <div class="flex flex-wrap justify-center gap-4 sm:gap-6">
                    <a href="ps/privacy-policy.html" class="text-gray-400 hover:text-primary transition-colors duration-300 text-xs sm:text-sm">Privacy Policy</a>
                    <a href="ps/privacy-policy.html" class="text-gray-400 hover:text-primary transition-colors duration-300 text-xs sm:text-sm">Terms of Service</a>
                </div>
            </div>
        </div>
    `;
    return footer;
}

/**
 * Initialize footer animations
 */
function initFooter() {
    // Prevent multiple initializations
    if (window.footerInitialized) return;
    window.footerInitialized = true;
    
    // Inject CSS styles first
    injectFooterStyles();
    
    // Create and append footer to body
    const footer = createFooter();
    if (footer) {
        document.body.appendChild(footer);
    }

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

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initFooter);
