// Seattle Legal Advisor - Professional JavaScript

// Mobile Navigation
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        }
    });
}

// Header scroll effect
const header = document.getElementById('header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Hide/show header on scroll
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Trigger number animation for stat cards
            if (entry.target.classList.contains('stat-card')) {
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.dataset.animated) {
                    animateStatNumber(statNumber);
                    statNumber.dataset.animated = 'true';
                }
            }
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .stat-card').forEach(el => {
    observer.observe(el);
});

// Animate stat numbers
function animateStatNumber(element) {
    const finalValue = element.textContent.replace(/\D/g, '');
    const suffix = element.textContent.replace(/\d/g, '');
    
    if (finalValue) {
        const duration = 2000;
        const startTimestamp = performance.now();
        
        const step = (timestamp) => {
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * parseInt(finalValue));
            element.textContent = currentValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }
}

// Contact form handling
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            company: formData.get('company'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            state: formData.get('state'),
            how_found: formData.get('how_found'),
            contact_method: formData.get('contact_method'),
            message: formData.get('message'),
            disclaimer: formData.get('disclaimer')
        };

        // Enhanced client-side validation
        const validation = validateForm(data);
        if (!validation.isValid) {
            showMessage(validation.message, 'error');
            return;
        }

        const submitButton = contactForm.querySelector('.submit-btn');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<span class="loading"></span> Sending Message...';
        submitButton.disabled = true;

        try {
            const response = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showMessage(result.message, 'success');
                contactForm.reset();
                
                // Add success animation
                submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitButton.style.background = '#10b981';
                
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.style.background = '#f59e0b';
                    submitButton.disabled = false;
                }, 3000);
            } else {
                showMessage(result.message, 'error');
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('There was an error sending your message. Please try again or call directly at 206-240-0442.', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Enhanced form validation
function validateForm(data) {
    if (!data.name || data.name.length < 2) {
        return { isValid: false, message: 'Please provide a valid name (at least 2 characters).' };
    }

    if (!data.email || !isValidEmail(data.email)) {
        return { isValid: false, message: 'Please provide a valid email address.' };
    }

    if (!data.phone || !isValidPhone(data.phone)) {
        return { isValid: false, message: 'Please provide a valid phone number (at least 10 digits).' };
    }

    if (!data.message || data.message.length < 10) {
        return { isValid: false, message: 'Please provide more details about your legal needs (at least 10 characters).' };
    }

    if (!data.disclaimer) {
        return { isValid: false, message: 'Please agree to the disclaimer to continue.' };
    }

    return { isValid: true, message: 'Form is valid' };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length >= 10;
}

// Show message function with enhanced styling
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        ${message}
    `;
    
    // Insert message before the form
    contactForm.parentNode.insertBefore(messageEl, contactForm);

    // Animate in
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
    }, 100);

    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (messageEl && messageEl.parentNode) {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 300);
        }
    }, 8000);
}

// Enhanced service card interactions
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach((card, index) => {
    // Stagger animation delays
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Enhanced hover effects
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(-5px) scale(1)';
        card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
    });
});

// Add phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        } else if (value.length >= 3) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        }
        e.target.value = value;
    });
}

// Enhanced form field interactions
const formInputs = document.querySelectorAll('input, textarea, select');
formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });

    // Real-time validation feedback
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = '#ef4444';
        } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
            this.style.borderColor = '#ef4444';
        } else if (this.id === 'phone' && this.value && !isValidPhone(this.value)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
    });
});

// Parallax effect for hero section
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroStats = document.querySelector('.hero-stats');
    
    if (heroStats && scrolled < window.innerHeight) {
        heroStats.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
    
    ticking = false;
}

function requestParallaxUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestParallaxUpdate);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Fade in page content
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Initialize immediate animations for hero section
    const heroElements = document.querySelectorAll('.hero .fade-in');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 200);
    });

    // Add loading states for better UX
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.style.opacity = '0';
            img.addEventListener('load', () => {
                img.style.transition = 'opacity 0.3s ease';
                img.style.opacity = '1';
            });
        }
    });

    // Initialize tooltips for form fields
    initializeTooltips();
});

// Tooltip system for form help
function initializeTooltips() {
    const tooltipData = {
        'name': 'Please provide your full legal name',
        'email': 'We will use this email to send you consultation details',
        'phone': 'Preferred number for scheduling your consultation',
        'message': 'Describe your legal situation in as much detail as possible'
    };

    Object.keys(tooltipData).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.title = tooltipData[fieldId];
        }
    });
}

// Keyboard accessibility improvements
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll handlers
const debouncedScrollHandler = debounce(() => {
    // Any additional scroll handling can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add error boundary for JavaScript errors
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // Could send error reports to monitoring service
});

// Service Worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment if you add a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then((registration) => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch((registrationError) => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}
