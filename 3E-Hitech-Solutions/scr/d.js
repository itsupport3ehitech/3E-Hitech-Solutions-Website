/**
 * 3E Hitech Solutions - Careers Page JavaScript
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

// Show job details modal
function showJobDetails(button) {
    const jobCard = button.closest('.job-card');
    const modal = document.getElementById('jobDetailsModal');
    
    if (!jobCard || !modal) return;
    
    // Extract job information
    const title = jobCard.querySelector('.job-header h3')?.textContent || '';
    const type = jobCard.querySelector('.job-type')?.textContent || '';
    const description = jobCard.querySelector('.job-description')?.textContent || '';
    const metaItems = jobCard.querySelectorAll('.job-meta div');
    const requirements = jobCard.querySelector('.job-requirements');
    
    // Populate modal
    document.getElementById('detailsJobTitle').textContent = title;
    document.getElementById('detailsJobType').textContent = type;
    document.getElementById('detailsJobDescription').textContent = description;
    
    // Populate meta information
    const metaContainer = document.getElementById('detailsJobMeta');
    metaContainer.innerHTML = '';
    metaItems.forEach(item => {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm';
        metaDiv.innerHTML = item.innerHTML;
        metaContainer.appendChild(metaDiv);
    });
    
    // Populate requirements
    const reqContainer = document.getElementById('detailsJobRequirements');
    reqContainer.innerHTML = requirements ? requirements.innerHTML : '';
    
    // Set up apply button
    const applyBtn = document.getElementById('detailsApplyBtn');
    applyBtn.setAttribute('data-job', title);
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// File upload handling
function initFileUpload() {
    const fileInput = document.getElementById('resumeFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Validate file size (10MB limit)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size exceeds 10MB limit. Please choose a smaller file.');
                fileInput.value = '';
                fileInfo?.classList.add('hidden');
                return;
            }
            
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please upload a PDF, DOC, or DOCX file.');
                fileInput.value = '';
                fileInfo?.classList.add('hidden');
                return;
            }
            
            // Show file info
            if (fileName) fileName.textContent = file.name;
            if (fileSize) fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            fileInfo?.classList.remove('hidden');
        } else {
            fileInfo?.classList.add('hidden');
        }
    });
}

// Application modal functions
function initApplicationModal() {
    const modal = document.getElementById('applicationModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelApplication');
    const form = document.getElementById('applicationForm');
    const applyBtns = document.querySelectorAll('.apply-btn');
    
    if (!modal || !form) return;
    
    // Open modal
    applyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const jobTitle = btn.getAttribute('data-job');
            const modalTitle = document.getElementById('modalJobTitle');
            if (modalTitle) modalTitle.textContent = jobTitle;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        form.reset();
        const fileInfo = document.getElementById('fileInfo');
        fileInfo?.classList.add('hidden');
    }
    
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('resumeFile');
        if (!fileInput?.files[0]) {
            alert('Please upload your CV/Resume before submitting.');
            return;
        }
        
        const formData = new FormData(form);
        const jobTitle = document.getElementById('modalJobTitle')?.textContent || '';
        const cvFile = fileInput.files[0];
        
        // Create comprehensive email body (fixed formatting)
        const emailBody = `Job Application for: ${jobTitle}

=== PERSONAL INFORMATION ===
Name: ${formData.get('firstName')} ${formData.get('lastName')}
Email: ${formData.get('email')}
Phone: ${formData.get('phone')}

=== EDUCATIONAL ATTAINMENT ===
Highest Degree: ${formData.get('degree')}
Field of Study: ${formData.get('fieldOfStudy')}
School/University: ${formData.get('school')}
Year Graduated: ${formData.get('graduationYear')}

=== WORK EXPERIENCE ===
Years of Experience: ${formData.get('experience')}
Current/Last Position: ${formData.get('currentPosition') || 'Not specified'}
Current/Last Company: ${formData.get('currentCompany') || 'Not specified'}
Key Skills & Technologies: ${formData.get('skills') || 'Not specified'}
 
=== COVER LETTER ===
${formData.get('coverLetter') || 'No cover letter provided'}

=== RESUME/CV ===
File: ${cvFile.name} (${(cvFile.size / 1024 / 1024).toFixed(2)} MB)

Note: Please find the CV file attached to this email.`;
        
        const recipients = 'hr@3ehitech.com,hr.assistant@3ehitech.com,hr.generalist@3ehitech.com';
        const mailtoLink = `mailto:${recipients}?subject=Job Application - ${encodeURIComponent(jobTitle)}&body=${encodeURIComponent(emailBody)}`;
        
        const successMsg = `Application prepared successfully!

Your email client will now open with a pre-filled message containing:p[;'\-]
• Personal Information
• Educational Background  
• Work Experience
• Cover Letter

IMPORTANT: Please attach your CV file (${cvFile.name}) before sending the email to ${recipients}`;
        
        alert(successMsg);
        window.location.href = mailtoLink;
        closeModal();
    });
}

// Initialize job details modal
function initJobDetailsModal() {
    const modal = document.getElementById('jobDetailsModal');
    const closeBtn = document.getElementById('closeDetailsModal');
    const closeBtnAlt = document.getElementById('closeDetailsBtn');
    const applyBtn = document.getElementById('detailsApplyBtn');
    
    if (!modal) return;
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    closeBtn?.addEventListener('click', closeModal);
    closeBtnAlt?.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    applyBtn?.addEventListener('click', () => {
        closeModal();
        const jobTitle = applyBtn.getAttribute('data-job');
        const modalTitle = document.getElementById('modalJobTitle');
        const appModal = document.getElementById('applicationModal');
        
        if (modalTitle) modalTitle.textContent = jobTitle;
        appModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
}

// Initialize all functions on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    initFooter();
    initFileUpload();
    initApplicationModal();
    initJobDetailsModal();
});
