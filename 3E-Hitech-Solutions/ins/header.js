/**
 * 
 * 3E Hitech Solutions - Header Maneager
 * - Manages header behavior across all pages
 * - Handles header visibility, scrolling effects, and mobile menu
 * 
 */

class HeaderManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.mobileMenuOpen = false;
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('about')) return 'about';
        if (path.includes('solutions')) return 'solutions';
        if (path.includes('contact')) return 'contact';
        if (path.includes('careers')) return 'careers';
        return 'home';
    }

    getBasePath() {
        return window.location.pathname.includes('/ps/') ? '../' : '';
    }

    generateHeader() {
    const basePath = this.getBasePath();

    return `<style>
    .header-container { position: fixed !important; width: 100% !important; z-index: 50 !important; transition: all 0.3s !important; background: white !important; box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important; }
    .header-container.scrolled { background: rgba(255,255,255,0.95) !important; backdrop-filter: blur(10px) !important; }
    .logo-container { display: flex !important; align-items: center !important; gap: 0.75rem !important; text-decoration: none !important; transition: transform 0.3s !important; }
    .logo-container:hover { transform: scale(1.05) !important; }
    .logo-image { height: 40px !important; width: auto !important; }
    .nav-link { padding: 0.5rem 1rem !important; border-radius: 0.5rem !important; font-weight: 500 !important; color: #374151 !important; text-decoration: none !important; transition: all 0.3s !important; display: flex !important; align-items: center !important; gap: 0.5rem !important; }
    .nav-link:hover, .nav-link.active { color: white !important; background: #0056b3 !important; }
    .mobile-menu-button { color: #1f2937 !important; background: none !important; border: none !important; padding: 0.5rem !important; border-radius: 0.5rem !important; cursor: pointer !important; transition: all 0.3s !important; display: block !important; }
    .mobile-menu-button:hover { background: #f3f4f6 !important; }
    .mobile-menu-button.open i { transform: rotate(90deg) !important; }
    .mobile-menu { background: white !important; box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; border-radius: 0 0 0.5rem 0.5rem !important; padding: 1rem !important; position: absolute !important; top: 100% !important; right: 0 !important; transform: translateY(-10px) !important; width: 90% !important; max-width: 300px !important; opacity: 0 !important; transition: all 0.3s ease !important; pointer-events: none !important; z-index: 1000 !important; }
    .mobile-menu.show { transform: translateY(0%) !important; opacity: 1 !important; pointer-events: auto !important; }
    .mobile-menu .flex.flex-col { text-align: left !important; }
    .mobile-menu .nav-link { text-align: left !important; justify-content: flex-start !important; }
    .mobile-overlay { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(0,0,0,0.3) !important; z-index: 40 !important; opacity: 0 !important; pointer-events: none !important; transition: opacity 0.3s !important; }
    .mobile-overlay.show { opacity: 1 !important; pointer-events: auto !important; }
    @media (max-width: 768px) {
        .md\\:hidden { display: block !important; }
        .hidden.md\\:flex { display: none !important; }
    }
</style>
    </style>
    <div id="mobile-overlay" class="mobile-overlay"></div>
    <header class="header-container">
        <div class="container mx-auto px-4" style="padding: 1rem;">
            <div class="flex justify-between items-center">
                <a href="${basePath}index.html" class="logo-container">
                    <img src="${basePath}src/imgs/logo/logo.png" alt="3E Hitech Solutions Inc. Logo" class="logo-image">
                </a>
                
                <nav class="hidden md:flex gap-6">
                    <a href="${basePath}index.html" class="nav-link ${this.currentPage === 'home' ? 'active' : ''}">
                        <i class="ri-home-4-line"></i> Home
                    </a>
                    <a href="${basePath}ps/solutions.html" class="nav-link ${this.currentPage === 'solutions' ? 'active' : ''}">
                        <i class="ri-stack-line"></i> Solutions
                    </a>
                    <a href="${basePath}ps/about.html" class="nav-link ${this.currentPage === 'about' ? 'active' : ''}">
                        <i class="ri-information-line"></i> About
                    </a>
                    <a href="${basePath}ps/careers.html" class="nav-link ${this.currentPage === 'careers' ? 'active' : ''}">
                        <i class="ri-briefcase-line"></i> Careers
                    </a>
                    <a href="${basePath}ps/contact.html" class="nav-link ${this.currentPage === 'contact' ? 'active' : ''}">
                        <i class="ri-mail-line"></i> Contact
                    </a>
                </nav>

                <div class="md:hidden">
                    <button id="mobile-menu-button" class="mobile-menu-button">
                        <i class="ri-menu-line" style="font-size: 1.5rem;"></i>
                    </button>
                </div>
            </div>

            <div id="mobile-menu" class="mobile-menu">
                <div class="flex flex-col">
                    <a href="${basePath}index.html" class="nav-link mobile-nav-link ${this.currentPage === 'home' ? 'active' : ''}">
                        <i class="ri-home-4-line"></i> Home
                    </a>
                    <a href="${basePath}ps/solutions.html" class="nav-link mobile-nav-link ${this.currentPage === 'solutions' ? 'active' : ''}">
                        <i class="ri-stack-line"></i> Solutions
                    </a>
                    <a href="${basePath}ps/about.html" class="nav-link mobile-nav-link ${this.currentPage === 'about' ? 'active' : ''}">
                        <i class="ri-information-line"></i> About
                    </a>
                    <a href="${basePath}ps/careers.html" class="nav-link mobile-nav-link ${this.currentPage === 'careers' ? 'active' : ''}">
                        <i class="ri-briefcase-line"></i> Careers
                    </a>
                    <a href="${basePath}ps/contact.html" class="nav-link mobile-nav-link ${this.currentPage === 'contact' ? 'active' : ''}">
                        <i class="ri-mail-line"></i> Contact
                    </a>
                </div>
            </div>
        </div>
    </header>`;    
}

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = this.generateHeader();
                setTimeout(() => {
                    this.initMobileMenu();
                    this.initScrollEffect();
                }, 0);
            }
        });
    }

    initMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');

        if (mobileMenuButton && mobileMenu && mobileOverlay) {
            mobileMenuButton.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            mobileOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });

            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileMenuButton = document.getElementById('mobile-menu-button');

        this.mobileMenuOpen = !this.mobileMenuOpen;

        if (this.mobileMenuOpen) {
            mobileMenu.classList.add('show');
            mobileOverlay.classList.add('show');
            mobileMenuButton.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileMenuButton = document.getElementById('mobile-menu-button');

        this.mobileMenuOpen = false;
        mobileMenu.classList.remove('show');
        mobileOverlay.classList.remove('show');
        mobileMenuButton.classList.remove('open');
        document.body.style.overflow = '';
    }

    initScrollEffect() {
        const header = document.querySelector('.header-container');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
    }
}

new HeaderManager();
