/**
 * 3E Hitech Solutions - Contact Page JavaScript
 * 
 * This file contains all interactive functionality for the website
 * including animations, sliders, and UI interactions.
 */


// Initialize AOS animations
function initAOS() {
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });
}

// FAQ accordion functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
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

/* Handles Inquiry Tabs Functionality */
function initInquiryTabs() {
    const tabs = document.querySelectorAll('.inquiry-tab');
    const forms = document.querySelectorAll('.inquiry-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            // Remove Active Class Class From All Tabs And Forms
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));

            // Add Active Class To Clicked Tab And Corresponding Form
            tab.classList.add('active');
            document.getElementById(`form-${tabId}`).classList.add('active');
        });
    });

    // Handle Form Submissions
    const inquiryForms = document.querySelectorAll('.inquiry-form-element');
    inquiryForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const recipientEmail = form.getAttribute('data-email');

            // Handles form submission logic
            console.log('Sending Inquiry To: ', recipientEmail, Object.fromEntries(formData));

            // Handles Success Sent Feedback
            alert('Successfully Submitted.');
            form.reset();
        });
    });
}

// Handles Initialization
document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    initFAQ();
    initFooter();
    initInquiryTabs();
});