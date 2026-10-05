/**
 * 
 * Cookie Consent Management Script
 * Handles cookie consent, preferences and compliance
 * 
 */

function initCookieConsent() {

    // Cookie utility functions
    const CookieUtils = {
        set: (name, value, days = 365) => {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
        },

        get: (name) => {
            return document.cookie.split('; ').find(row => row.startsWith(name + '='))
            ?.split('=')[1] ? decodeURIComponent(document.cookie.split('; ')
            .find(row => row.startsWith(name + '=')) ?.split('=')[1]) : null;
        },

        remove: (name) => {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    };

    // Check if consent is already given
    const consentStatus = CookieUtils.get('3e-cookie-consent');
    if (consentStatus) return;

    // Create cookie banner
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-content">
            <div class="cookie-icon">
                <i class="ri-shield-check-line"></i>
            </div>
            <div class="cookie-text">
                <h3>We Value Your Privacy</h3>
                <p>We Use Cookies To Enhance Your Experience, Analyze Site Traffic, And Provide Personalized Content. By Continuing To 
                   Browse, You Consent To Our Use Of Cookies.
                </p>
            </div>
            <div class="cookie-actions">
                <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">
                    <i class="ri-check-line"></i>
                        Accept All
                </button>
                <button id="cookie-customize" class="cookie-btn cookie-btn-secondary">
                    <i class="ri-settings-3-line"></i>
                        Customize
                </button>
                <button id="cookie-decline" class="cookie-btn cookie-btn-outline">
                    Decline
                </button>
            </div>
        </div>
    `;

    // Create Preferences Modal
    const modal = document.createElement('div');
    modal.id = 'cookie-preferences-modal';
    modal.className = 'cookie-modal hidden';
    modal.innerHTML = `
        <div class="cookie-modal-overlay"></div>
        <div class="cookie-modal-content">
            <div class="cookie-modal-header">
                <h2>Cookie Preferences</h2>
                <button id="cookie-modal-close" class="cookie-close-btn">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="cookie-modal-body">
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h3>Essential Cookies</h3>
                        <label class="cookie-toggle">
                            <input type="checkbox" checked disabled>
                            <span class="cookie-slider"></span>
                        </label>
                    </div>
                    <p>Required for basic functionality. Cannot be disabled.</p>
                </div>
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h3>Analytics Cookies</h3>
                        <label class="cookie-toggle">
                            <input type="checkbox" id="analytics-cookies">
                            <span class="cookie-slider"></span>
                        </label>
                    </div>
                    <p>Help us understand how vistors interact with our website.</p>
                </div>
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h3>Marketing Cookies</h3>
                        <label class="cookie-toggle">
                            <input type="checkbox" id="marketing-cookies">
                            <span class="cookie-slider"></span>
                        </label>
                    </div>
                    <p>USed to deliver personalized advertisements and content.</p>
                </div>
                <div class="cookie-modal-footer">
                    <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">
                        Save Preferences
                    </button>
                    <button id="cookie-accept-all-modal" class="cookie-btn cookie-btn-secondary">
                        Accept All
                    </button>
                </div>
            </div>
        `;

        // Add To Page
        document.body.appendChild(banner);
        document.body.appendChild(modal);

        // Event Handlers
        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            acceptAllCookies();
            hideBanner();
        });

        document.getElementById('cookie-decline').addEventListener('click', () => {
            declineCookies();
            hideBanner();
        });

        document.getElementById('cookie-customize').addEventListener('click', showModal);
        document.getElementById('cookie-modal-close').addEventListener('click', hideModal);
        document.getElementById('cookie-save-preferences').addEventListener('click', () => {
            acceptAllCookies();
            hideModal();
            hideBanner();
        });

        document.getElementById('cookie-save-preferences').addEventListener('click', () => {
            savePreferences();
            hideModal();
            hideBanner();
        });

        // Close Modal On Overlay Click
        modal.querySelector('.cookie-modal-overlay').addEventListener('click', hideModal);

        function acceptAllCookies() {
            CookieUtils.set('3e-cookie-consent', 'all');
            CookieUtils.set('3e-analytics-cookies', 'true');
            CookieUtils.set('3e-marketing-cookies', 'true');
            initializeAnalytics();
        }

        function declineCookies() {
            CookieUtils.set('3e-cookie-consent', 'essential');
            CookieUtils.set('3e-analytics-consent', 'false');
            CookieUtils.set('3e-marketing-cookies', 'true');
        }

        function savePreferences() {
            const analytics = document.getElementById('analytics-cookies').checked;
            const marketing = document.getElementById('marketing-cookies').checked;

            CookieUtils.set('3e-cookie-consent', 'custom');
            CookieUtils.set('3e-analytics-consent', analytics.toString());
            CookieUtils.set('3e-marketing-consent', marketing.toString());

            if (analytics) initializeAnalytics();
        }

        function showModal() {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function hideModal() {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }

        function hideBanner() {
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 300);
        }

        function initializeAnalytics() {
            // Initialize Google Analytics Or Other Tracking
            console.log('Analytics initialized');
        }

        // Show banner with animation
        setTimeout(() => {
            banner.style.transform = 'translateY(0)';
        }, 1000);
}

document.addEventListener('DOMContentLoaded', function() {
    initCookieConsent();
});