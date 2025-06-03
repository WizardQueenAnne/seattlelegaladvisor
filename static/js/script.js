// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
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
        }
    });
});

// Fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
    };

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Sending...';
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
            // Show success message
            showMessage(result.message, 'success');
            contactForm.reset();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('There was an error sending your message. Please try again or call directly.', 'error');
    } finally {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

// Show message function
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    
    // Add styles
    messageEl.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 0.5rem;
        font-weight: 500;
        text-align: center;
        transition: all 0.3s ease;
        ${type === 'success' 
            ? 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' 
            : 'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'
        }
    `;

    // Insert message after form
    contactForm.parentNode.insertBefore(messageEl, contactForm.nextSibling);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl) {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-10px)';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 5000);
}

// Add touch feedback for mobile devices
if ('ontouchstart' in window) {
    const touchElements = document.querySelectorAll('.btn, .service-card, .hero-card, .about-card');
    
    touchElements.forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        el.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
}

// Lazy loading for better performance
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
                
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Add parallax effect for hero section (optional enhancement)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroCard = document.querySelector('.hero-card');
    
    if (heroCard && scrolled < window.innerHeight) {
        heroCard.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure smooth initial load
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Add animation class to elements that should animate immediately
    const immediateAnimations = document.querySelectorAll('.hero .fade-in');
    immediateAnimations.forEach(el => {
        el.classList.add('visible');
    });
});
