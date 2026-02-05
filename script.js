// PMS (Path Management System) - Use centralized path resolution
// All path operations now go through PMS
function getBasePath() {
    if (window.PMS) {
        return window.PMS.getBasePath();
    }
    // Fallback if PMS not loaded
    return '';
}

// Load Components
document.addEventListener('DOMContentLoaded', function() {
    // Ensure PMS is initialized
    if (!window.PMS) {
        console.error('PMS not loaded! Path resolution may fail.');
    }
    
    const basePath = getBasePath();
    
    // Load Header
    const headerPath = window.PMS ? window.PMS.getComponentPath('header.html') : (basePath + 'components/header.html');
    fetch(headerPath)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load header');
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
                // Fix paths in loaded header using PMS
                if (window.PMS) {
                    window.PMS.fixPathsInContainer(headerPlaceholder);
                }
                // Initialize navigation features after header loads
                setActiveNavLink();
                initMobileMenu();
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            // Fallback: show basic navigation if header fails to load
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = '<div class="container"><nav><a href="/">Home</a> | <a href="/contact">Contact</a></nav></div>';
            }
        });

    // Load Footer
    fetch(basePath + 'components/footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load footer');
            return response.text();
        })
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
                // Fix paths in loaded footer using PMS
                if (window.PMS) {
                    window.PMS.fixPathsInContainer(footerPlaceholder);
                }
                // Update copyright year
                updateCopyrightYear();
            }
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            // Fallback: show basic footer if footer fails to load
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                const currentYear = new Date().getFullYear();
                footerPlaceholder.innerHTML = `<footer class="footer"><div class="container"><p>&copy; ${currentYear} Paxi Technologies. All rights reserved.</p></div></footer>`;
            }
        });

    // Load Cookie Banner
    const cookieBannerPath = window.PMS ? window.PMS.getComponentPath('cookie-banner.html') : (basePath + 'components/cookie-banner.html');
    fetch(cookieBannerPath)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load cookie banner');
            return response.text();
        })
        .then(data => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            // Fix paths in cookie banner HTML before inserting
            if (window.PMS) {
                window.PMS.fixPathsInContainer(tempDiv);
            }
            document.body.insertAdjacentHTML('beforeend', tempDiv.innerHTML);
            // Initialize cookie consent after banner is loaded
            initCookieConsent();
        })
        .catch(error => {
            console.error('Error loading cookie banner:', error);
        });
    
    // Note: Chat widget is loaded separately via initChatWidget()
});

// Update copyright year automatically
function updateCopyrightYear() {
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
    }
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    
    // Normalize current path (remove trailing slash, handle index.html)
    let normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
    if (normalizedCurrent.endsWith('/index.html')) {
        normalizedCurrent = normalizedCurrent.replace('/index.html', '') || '/';
    }
    
    // Process main navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        let linkPath = link.getAttribute('href');
        // Handle absolute paths
        if (linkPath && linkPath.startsWith('/')) {
            linkPath = linkPath.replace(/\/$/, '') || '/';
        } else if (linkPath) {
            // Handle relative paths
            try {
                linkPath = new URL(link.href, window.location.origin).pathname;
                linkPath = linkPath.replace(/\/$/, '') || '/';
            } catch (e) {
                // Skip invalid URLs
                return;
            }
        } else {
            return;
        }
        
        // Check if paths match
        if (linkPath === normalizedCurrent || 
            (normalizedCurrent === '/' && link.getAttribute('data-page') === 'home')) {
            link.classList.add('active');
        }
    });
    
    // Process dropdown menu links (for service pages)
    const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
    dropdownLinks.forEach(link => {
        let linkPath = link.getAttribute('href');
        // Handle absolute paths
        if (linkPath && linkPath.startsWith('/')) {
            linkPath = linkPath.replace(/\/$/, '') || '/';
        } else if (linkPath) {
            // Handle relative paths
            try {
                linkPath = new URL(link.href, window.location.origin).pathname;
                linkPath = linkPath.replace(/\/$/, '') || '/';
            } catch (e) {
                // Skip invalid URLs
                return;
            }
        } else {
            return;
        }
        
        // Check if paths match (for service pages)
        if (linkPath === normalizedCurrent) {
            link.classList.add('active');
            // Also mark parent dropdown as active
            const dropdown = link.closest('.dropdown');
            if (dropdown) {
                dropdown.classList.add('active');
            }
        }
    });
}

// Mobile Navigation Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Create backdrop element if it doesn't exist
    let backdrop = document.querySelector('.mobile-menu-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'mobile-menu-backdrop';
        document.body.appendChild(backdrop);
    }
    
    // Toggle main mobile menu
    if (mobileMenuToggle && nav) {
        const toggleMenu = function(open) {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            const shouldOpen = open !== undefined ? open : !isExpanded;
            
            mobileMenuToggle.setAttribute('aria-expanded', shouldOpen);
            nav.classList.toggle('mobile-open', shouldOpen);
            backdrop.classList.toggle('active', shouldOpen);
            
            // Prevent body scroll when menu is open
            if (shouldOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };
        
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking backdrop
        backdrop.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu(false);
        });
        
        // Close menu when clicking outside (but not on backdrop, handled above)
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('mobile-open') && 
                !nav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) &&
                !backdrop.contains(e.target)) {
                toggleMenu(false);
            }
        });
        
        // Close menu on window resize to desktop
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    toggleMenu(false);
                }
            }, 250);
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
                toggleMenu(false);
            }
        });
    }
    
    // Handle Services dropdown on mobile
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            // Remove any existing listeners by cloning and replacing
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            // Add click handler for mobile/tablet
            newToggle.addEventListener('click', function(e) {
                // Only prevent default and toggle on mobile/tablet
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    const isVisible = menu.style.display === 'block';
                    menu.style.display = isVisible ? 'none' : 'block';
                    // Update ARIA expanded state
                    newToggle.setAttribute('aria-expanded', !isVisible);
                }
            });
            
            // Handle window resize - reset display style on desktop
            const handleResize = function() {
                if (window.innerWidth > 768) {
                    menu.style.display = '';
                    newToggle.setAttribute('aria-expanded', 'false');
                }
            };
            
            window.addEventListener('resize', handleResize);
        }
    });
}

// Form Validation Enhancement
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form elements
        const name = contactForm.querySelector('#name');
        const email = contactForm.querySelector('#email');
        const subject = contactForm.querySelector('#subject');
        const message = contactForm.querySelector('#message');
        
        // Clear previous errors
        clearFormErrors(contactForm);
        
        // Validate form
        let isValid = true;
        
        if (!name.value.trim()) {
            showFieldError(name, 'Name is required');
            isValid = false;
        }
        
        if (!email.value.trim()) {
            showFieldError(email, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!subject.value) {
            showFieldError(subject, 'Please select a subject');
            isValid = false;
        }
        
        if (!message.value.trim()) {
            showFieldError(message, 'Message is required');
            isValid = false;
        } else if (message.value.trim().length < 10) {
            showFieldError(message, 'Message must be at least 10 characters');
            isValid = false;
        }
        
        if (isValid) {
            // Form is valid - in a real application, submit to server
            // For now, show success message
            showFormSuccess(contactForm);
        }
    });
    
    // Real-time validation on blur
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        input.addEventListener('input', function() {
            // Clear error when user starts typing
            if (input.classList.contains('error')) {
                clearFieldError(input);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = field.getAttribute('data-error') || 'This field is required';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (field.id === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearFormErrors(form) {
    const errors = form.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
    });
}

function showFormSuccess(form) {
    // Show toast notification instead of inline message
    showToast('Thank you! Your message has been received. We will respond during normal business hours.', 'success', 5000);
    form.reset();
    
    // Also show inline message for accessibility
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.setAttribute('role', 'alert');
    successMessage.innerHTML = '<p>Thank you! Your message has been received. We will respond during normal business hours.</p>';
    form.parentNode.insertBefore(successMessage, form);
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Remove success message after 10 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 10000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Initialize form validation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initScrollAnimations();
    initBackToTop();
    
    // Load configuration and initialize integrations
    loadConfig().then(() => {
        // Load integration scripts
        Promise.all([
            import('./js/api-client.js').catch(() => null),
            import('./js/ai-chatbot.js').catch(() => null),
            import('./js/live-chat-integration.js').catch(() => null)
        ]).then(() => {
            // Initialize live chat service first (if enabled)
            if (typeof window.initLiveChat === 'function') {
                window.initLiveChat();
            }
            
            // Initialize AI chatbot
            if (typeof window.initAIChatbot === 'function') {
                window.initAIChatbot();
            }
            
            // Initialize API client
            if (typeof window.initAPIClient === 'function') {
                window.initAPIClient();
            }
            
            // Initialize custom chat widget (only if live chat is not enabled)
            if (!window.liveChat || !window.liveChat.activeService) {
                initChatWidget();
            }
        }).catch(() => {
            // If integrations fail to load, use default chat widget
            initChatWidget();
        });
    }).catch(() => {
        // If config fails to load, use default chat widget
        initChatWidget();
    });
});

// Load configuration file
async function loadConfig() {
    try {
        // Try to load config.js (ES6 module)
        const configModule = await import('./config.js');
        if (configModule && configModule.config) {
            window.config = configModule.config;
            return;
        }
    } catch (e) {
        // Config file doesn't exist or failed to load - use defaults
        console.log('Config file not found, using default settings');
    }
    
    // Default configuration (no API keys, all features disabled)
    window.config = {
        openai: { 
            apiKey: '', 
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 500,
            enabled: false 
        },
        liveChat: { 
            intercom: { appId: '', enabled: false }, 
            drift: { accountId: '', enabled: false }, 
            zendesk: { key: '', enabled: false } 
        },
        api: { 
            baseUrl: '', 
            endpoints: {
                chat: '/api/chat/message',
                history: '/api/chat/history',
                contact: '/api/contact/submit',
                analytics: '/api/analytics/track'
            },
            timeout: 10000,
            retries: 3,
            enabled: false 
        },
        analytics: {
            googleAnalytics: { trackingId: '', enabled: false }
        },
        email: {
            service: 'sendgrid',
            apiKey: '',
            fromEmail: 'noreply@paxitechnologies.com',
            fromName: 'Paxi Technologies'
        }
    };
}

// ===== COOKIE CONSENT FUNCTIONALITY =====

function initCookieConsent() {
    // Check if user has already made a choice
    const cookieConsent = getCookie('cookie_consent');
    
    if (!cookieConsent) {
        // Show banner if no consent has been given
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.display = 'block';
        }
    }
    
    // Set up event listeners
    setupCookieListeners();
}

function setupCookieListeners() {
    // Accept All button
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', function() {
            setCookieConsent(true, true, true);
            hideCookieBanner();
        });
    }
    
    // Reject button (only essential cookies)
    const rejectBtn = document.getElementById('cookie-reject');
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            setCookieConsent(true, false, false);
            hideCookieBanner();
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('cookie-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            showCookieSettings();
        });
    }
    
    // Modal close button
    const modalCloseBtn = document.getElementById('cookie-modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', function() {
            hideCookieSettings();
        });
    }
    
    // Save settings button
    const saveSettingsBtn = document.getElementById('cookie-save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            const essential = document.getElementById('cookie-essential').checked;
            const analytics = document.getElementById('cookie-analytics').checked;
            const functional = document.getElementById('cookie-functional').checked;
            setCookieConsent(essential, analytics, functional);
            hideCookieBanner();
            hideCookieSettings();
        });
    }
    
    // Accept All in modal
    const acceptAllModalBtn = document.getElementById('cookie-accept-all-modal');
    if (acceptAllModalBtn) {
        acceptAllModalBtn.addEventListener('click', function() {
            setCookieConsent(true, true, true);
            hideCookieBanner();
            hideCookieSettings();
        });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideCookieSettings();
            }
        });
    }
    
    // Load saved preferences into settings modal
    loadCookiePreferences();
}

function setCookieConsent(essential, analytics, functional) {
    // Set consent cookie (expires in 1 year)
    const consentData = {
        essential: essential,
        analytics: analytics,
        functional: functional,
        timestamp: new Date().toISOString()
    };
    
    setCookie('cookie_consent', JSON.stringify(consentData), 365);
    
    // Apply cookie preferences
    if (analytics) {
        // Enable analytics cookies (e.g., Google Analytics)
        // Add your analytics code here if needed
    } else {
        // Disable analytics cookies
    }
    
    if (functional) {
        // Enable functional cookies
    } else {
        // Disable functional cookies
    }
}

function getCookieConsent() {
    const consentCookie = getCookie('cookie_consent');
    if (consentCookie) {
        try {
            return JSON.parse(consentCookie);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function loadCookiePreferences() {
    const consent = getCookieConsent();
    if (consent) {
        const analyticsCheckbox = document.getElementById('cookie-analytics');
        const functionalCheckbox = document.getElementById('cookie-functional');
        
        if (analyticsCheckbox) {
            analyticsCheckbox.checked = consent.analytics || false;
        }
        if (functionalCheckbox) {
            functionalCheckbox.checked = consent.functional || false;
        }
    }
}

function showCookieSettings() {
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function hideCookieSettings() {
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// Cookie utility functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
}

// ===== SCROLL ANIMATIONS =====

function initScrollAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return; // Skip animations if user prefers reduced motion
    }
    
    // Create Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with scroll animation classes
    const animatedElements = document.querySelectorAll(
        '.scroll-fade-in, .scroll-fade-in-left, .scroll-fade-in-right, .scroll-stagger'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ===== BACK TO TOP BUTTON =====

function initBackToTop() {
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 15l-6-6-6 6"/>
        </svg>
    `;
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        
        lastScrollTop = scrollTop;
    }, false);
    
    // Smooth scroll to top on click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== TOAST NOTIFICATIONS =====

function showToast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icons for different toast types
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close">×</button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            hideToast(toast);
        }, duration);
    }
    
    return toast;
}

function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// ===== ANIMATED COUNTERS =====

function animateCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const startTime = performance.now();
    const isPercentage = element.textContent.includes('%');
    const hasPlus = element.textContent.includes('+');
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        // Format the number
        let displayValue = formatNumber(current);
        
        // Add suffix if needed
        if (isPercentage && !displayValue.includes('%')) {
            displayValue += '%';
        } else if (hasPlus && !displayValue.includes('+')) {
            displayValue += '+';
        }
        
        element.textContent = displayValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            // Ensure final value is exact
            let finalValue = formatNumber(target);
            if (isPercentage) finalValue += '%';
            if (hasPlus) finalValue += '+';
            element.textContent = finalValue;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const observerOptions = {
        threshold: 0.3, // Trigger when 30% visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before fully visible
    };
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const target = parseInt(entry.target.getAttribute('data-target'));
                
                if (prefersReducedMotion) {
                    // Skip animation, show final value immediately
                    let finalValue = formatNumber(target);
                    if (entry.target.textContent.includes('%')) finalValue += '%';
                    if (entry.target.textContent.includes('+')) finalValue += '+';
                    entry.target.textContent = finalValue;
                } else {
                    // Animate counter
                    animateCounter(entry.target, target);
                }
                
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => {
        counterObserver.observe(stat);
    });
}

// Auto-update statistics periodically (optional - can be enabled)
function initAutoUpdateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    // Check if auto-update is enabled via data attribute
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection || statsSection.dataset.autoUpdate !== 'true') {
        return; // Auto-update disabled by default
    }
    
    // Update stats every 5 minutes (300000ms)
    setInterval(() => {
        statNumbers.forEach(stat => {
            const currentTarget = parseInt(stat.getAttribute('data-target'));
            const currentValue = parseInt(stat.textContent.replace(/[^0-9]/g, '')) || 0;
            
            // Only update if there's a difference (simulate small increments)
            if (currentValue < currentTarget) {
                const increment = Math.max(1, Math.floor(currentTarget * 0.01)); // 1% increment
                const newValue = Math.min(currentValue + increment, currentTarget);
                
                // Re-animate to new value
                const isPercentage = stat.textContent.includes('%');
                const hasPlus = stat.textContent.includes('+');
                let displayValue = formatNumber(newValue);
                if (isPercentage) displayValue += '%';
                if (hasPlus) displayValue += '+';
                stat.textContent = displayValue;
                
                // Update data-target to new value
                stat.setAttribute('data-target', newValue);
            }
        });
    }, 300000); // 5 minutes
}

// Initialize counters when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initCounters();
    // Uncomment next line to enable periodic auto-updates
    // initAutoUpdateStats();
});

// ===== CHAT WIDGET =====

function initChatWidget() {
    // Load chat widget HTML using PMS
    const chatWidgetPath = window.PMS ? window.PMS.getComponentPath('chat-widget.html') : (getBasePath() + 'components/chat-widget.html');
    
    fetch(chatWidgetPath)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load chat widget');
            return response.text();
        })
                    .then(html => {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;
                        // Fix paths in chat widget HTML before inserting
                        if (window.PMS) {
                            window.PMS.fixPathsInContainer(tempDiv);
                        }
                        document.body.insertAdjacentHTML('beforeend', tempDiv.innerHTML);
                        setupChatWidget();
                    })
        .catch(error => {
            console.error('Error loading chat widget:', error);
        });
}

function setupChatWidget() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    const quickActions = document.querySelectorAll('.quick-action-btn');
    const emailCaptureModal = document.getElementById('email-capture-modal');
    const emailCaptureForm = document.getElementById('email-capture-form');
    const emailCaptureSkip = document.getElementById('email-capture-skip');
    
    // Chat context tracking - MUST be declared before loadChatHistory
    let chatContext = {
        messageCount: 0,
        userEmail: null,
        conversationHistory: []
    };
    
    // Initialize chat history
    loadChatHistory();
    
    // Create backdrop for mobile if it doesn't exist
    let chatBackdrop = document.querySelector('.chat-window-backdrop');
    if (!chatBackdrop) {
        chatBackdrop = document.createElement('div');
        chatBackdrop.className = 'chat-window-backdrop';
        document.body.appendChild(chatBackdrop);
    }
    
    const toggleChatWindow = (open) => {
        const isOpen = chatWindow.classList.contains('open');
        const shouldOpen = open !== undefined ? open : !isOpen;
        const isMobile = window.innerWidth <= 768;
        
        if (shouldOpen) {
            chatWindow.classList.add('open');
            // Force display and pointer-events for mobile compatibility
            if (isMobile) {
                chatWindow.style.display = 'flex';
                chatWindow.style.pointerEvents = 'auto';
            }
            if (chatBackdrop) {
                chatBackdrop.classList.add('active');
                if (isMobile) {
                    chatBackdrop.style.display = 'block';
                    chatBackdrop.style.pointerEvents = 'auto';
                }
            }
            // Only lock body scroll on mobile
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
            setTimeout(() => {
                if (chatInput) chatInput.focus();
            }, 100);
            // Check if should show email capture
            checkEmailCapture();
        } else {
            chatWindow.classList.remove('open');
            if (isMobile) {
                chatWindow.style.display = 'none';
                chatWindow.style.pointerEvents = 'none';
            }
            if (chatBackdrop) {
                chatBackdrop.classList.remove('active');
                if (isMobile) {
                    chatBackdrop.style.display = 'none';
                    chatBackdrop.style.pointerEvents = 'none';
                }
            }
            document.body.style.overflow = '';
        }
    };
    
    // Toggle chat window - support both click and touch events for mobile
    if (chatToggle) {
        const handleToggle = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChatWindow();
        };
        chatToggle.addEventListener('click', handleToggle);
        chatToggle.addEventListener('touchend', handleToggle); // Mobile touch support
    }
    
    // Close chat window - support both click and touch events for mobile
    if (chatClose) {
        const handleClose = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Stop all handlers
            console.log('Close button clicked'); // Debug log
            toggleChatWindow(false);
        };
        // Use capture phase to ensure handler runs before chat window handler
        chatClose.addEventListener('click', handleClose, true);
        chatClose.addEventListener('touchend', handleClose, true); // Mobile touch support
        // Also add in bubble phase as backup
        chatClose.addEventListener('click', handleClose, false);
        chatClose.addEventListener('touchend', handleClose, false);
    }
    
    // Close chat when clicking backdrop (mobile) - support touch
    // IMPORTANT: Only close if clicking directly on backdrop, not on chat window content
    if (chatBackdrop) {
        const handleBackdropClose = (e) => {
            // Only close if clicking directly on backdrop, not if event bubbled from chat window
            if (e.target === chatBackdrop) {
                e.preventDefault();
                e.stopPropagation();
                toggleChatWindow(false);
            }
        };
        chatBackdrop.addEventListener('click', handleBackdropClose);
        chatBackdrop.addEventListener('touchend', handleBackdropClose); // Mobile touch support
    }
    
    // Prevent clicks inside chat window from closing it (stop propagation to backdrop)
    // BUT allow close button clicks to work
    if (chatWindow) {
        const handleChatWindowClick = (e) => {
            // Don't stop propagation for close button - let it work normally
            if (e.target.closest('#chat-close')) {
                return; // Let close button handle its own event
            }
            // Stop propagation to prevent backdrop from receiving the event
            e.stopPropagation();
        };
        chatWindow.addEventListener('click', handleChatWindowClick, true); // Use capture phase
        chatWindow.addEventListener('touchend', handleChatWindowClick, true); // Use capture phase
    }
    
    // Close chat on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWindow.classList.contains('open')) {
            toggleChatWindow(false);
        }
    });
    
    // Close chat when mobile menu opens (to avoid conflicts)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            if (chatWindow.classList.contains('open') && window.innerWidth <= 768) {
                toggleChatWindow(false);
            }
        });
    }
    
    // Send message on Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Send message on button click - support touch for mobile
    if (chatSend) {
        const handleSend = (e) => {
            e.preventDefault();
            e.stopPropagation();
            sendMessage();
        };
        chatSend.addEventListener('click', handleSend);
        chatSend.addEventListener('touchend', handleSend); // Mobile touch support
    }
    
    // Quick action buttons - support touch for mobile
    // Quick action buttons - support touch for mobile
    quickActions.forEach(btn => {
        const handleQuickActionClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            handleQuickAction(action);
        };
        btn.addEventListener('click', handleQuickActionClick);
        btn.addEventListener('touchend', handleQuickActionClick); // Mobile touch support
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Track conversation
        chatContext.messageCount++;
        chatContext.conversationHistory.push({
            type: 'user',
            message: message,
            timestamp: new Date().toISOString()
        });
        
        // Save to history
        saveChatHistory();
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process message and get response
        setTimeout(async () => {
            hideTypingIndicator();
            
            let response;
            
            // Try AI chatbot first (if enabled)
            if (window.aiChatbot && window.aiChatbot.enabled) {
                try {
                    const aiResponse = await window.aiChatbot.generateResponse(message, chatContext);
                    if (aiResponse) {
                        response = aiResponse;
                        
                        // Try to send to backend API for logging
                        if (window.apiClient) {
                            window.apiClient.sendChatMessage(message, chatContext).catch(() => {
                                // Silently fail if API is not available
                            });
                        }
                    } else {
                        // Fall back to rule-based
                        response = processMessage(message, chatContext);
                    }
                } catch (error) {
                    console.error('AI chatbot error:', error);
                    // Fall back to rule-based
                    response = processMessage(message, chatContext);
                }
            } else {
                // Use rule-based responses
                response = processMessage(message, chatContext);
                
                // Try to send to backend API if available
                if (window.apiClient) {
                    window.apiClient.sendChatMessage(message, chatContext).catch(() => {
                        // Silently fail if API is not available
                    });
                }
            }
            
            addMessage(response, 'bot');
            
            // Track bot response
            chatContext.conversationHistory.push({
                type: 'bot',
                message: response,
                timestamp: new Date().toISOString()
            });
            
            // Save to history
            saveChatHistory();
            
            // Check if should show email capture (after 3 messages)
            if (chatContext.messageCount === 3 && !chatContext.userEmail) {
                setTimeout(() => {
                    showEmailCapture();
                }, 500);
            }
        }, 1000 + Math.random() * 1000); // Simulate thinking time
    }
    
    // Email capture functions
    function checkEmailCapture() {
        // Email is already loaded in loadChatHistory()
        // This function can be used for additional checks if needed
    }
    
    function showEmailCapture() {
        if (emailCaptureModal && !chatContext.userEmail) {
            emailCaptureModal.style.display = 'flex';
        }
    }
    
    function hideEmailCapture() {
        if (emailCaptureModal) {
            emailCaptureModal.style.display = 'none';
        }
    }
    
    if (emailCaptureForm) {
        emailCaptureForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email-capture-input').value.trim();
            
            if (email && isValidEmail(email)) {
                chatContext.userEmail = email;
                localStorage.setItem('chat_user_email', email);
                localStorage.setItem('chat_email_timestamp', new Date().toISOString());
                
                // Track email capture
                trackChatEvent('email_captured', { email: email });
                
                hideEmailCapture();
                addMessage('Thank you! We\'ll keep you updated with relevant IT service information.', 'bot');
                
                // Save to history
                saveChatHistory();
            }
        });
    }
    
    if (emailCaptureSkip) {
        emailCaptureSkip.addEventListener('click', () => {
            hideEmailCapture();
            localStorage.setItem('chat_email_skipped', 'true');
            trackChatEvent('email_skipped', {});
        });
    }
    
    // Chat history functions
    function saveChatHistory() {
        try {
            const history = {
                messages: chatContext.conversationHistory,
                lastUpdated: new Date().toISOString(),
                messageCount: chatContext.messageCount
            };
            localStorage.setItem('chat_history', JSON.stringify(history));
        } catch (e) {
            console.error('Error saving chat history:', e);
        }
    }
    
    function loadChatHistory() {
        try {
            const savedHistory = localStorage.getItem('chat_history');
            if (savedHistory) {
                const history = JSON.parse(savedHistory);
                chatContext.conversationHistory = history.messages || [];
                chatContext.messageCount = history.messageCount || 0;
                
                // Restore messages (limit to last 10 for performance)
                const recentMessages = chatContext.conversationHistory.slice(-10);
                recentMessages.forEach(msg => {
                    if (msg.type === 'user' || msg.type === 'bot') {
                        addMessage(msg.message, msg.type, false); // false = don't save again
                    }
                });
            }
            
            // Load saved email if exists
            const savedEmail = localStorage.getItem('chat_user_email');
            if (savedEmail) {
                chatContext.userEmail = savedEmail;
            }
        } catch (e) {
            console.error('Error loading chat history:', e);
        }
    }
    
    function clearChatHistory() {
        localStorage.removeItem('chat_history');
        chatContext.conversationHistory = [];
        chatContext.messageCount = 0;
    }
    
    // Analytics tracking
    function trackChatEvent(eventName, data) {
        // Track chat events (can be integrated with Google Analytics, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Chat Widget',
                ...data
            });
        }
        
        // Store locally for analytics
        try {
            const events = JSON.parse(localStorage.getItem('chat_analytics') || '[]');
            events.push({
                event: eventName,
                data: data,
                timestamp: new Date().toISOString()
            });
            // Keep only last 100 events
            if (events.length > 100) {
                events.shift();
            }
            localStorage.setItem('chat_analytics', JSON.stringify(events));
        } catch (e) {
            console.error('Error tracking chat event:', e);
        }
    }
    
        // Track chat opened
        trackChatEvent('chat_opened', {});
        
        // Add clear history function (for testing/admin)
        window.clearChatHistory = clearChatHistory;
    
    function addMessage(text, type, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'bot' ? 'PT' : 'You';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Check if text contains HTML (from createResponseWithActions)
        if (text.includes('<')) {
            content.innerHTML = text;
            
            // Add click tracking to action buttons and prevent backdrop from closing
            const actionButtons = content.querySelectorAll('.chat-action-btn');
            actionButtons.forEach(btn => {
                const handleActionClick = (e) => {
                    // Stop propagation to prevent backdrop from receiving the event
                    e.stopPropagation();
                    const url = btn.getAttribute('href');
                    trackChatEvent('action_button_clicked', {
                        button_text: btn.textContent,
                        url: url
                    });
                };
                btn.addEventListener('click', handleActionClick);
                btn.addEventListener('touchend', handleActionClick); // Mobile touch support
            });
            
            // Also prevent propagation for all links inside chat messages
            const allLinks = content.querySelectorAll('a');
            allLinks.forEach(link => {
                const handleLinkClick = (e) => {
                    // Stop propagation to prevent backdrop from receiving the event
                    e.stopPropagation();
                };
                link.addEventListener('click', handleLinkClick);
                link.addEventListener('touchend', handleLinkClick); // Mobile touch support
            });
        } else {
            // Handle plain text multi-line messages
            const paragraphs = text.split('\n').filter(p => p.trim());
            paragraphs.forEach(p => {
                const para = document.createElement('p');
                para.textContent = p;
                content.appendChild(para);
            });
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Track message sent
        if (saveToHistory && type === 'user') {
            trackChatEvent('message_sent', { message_length: text.length });
        }
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">PT</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    function handleQuickAction(action) {
        let message = '';
        switch(action) {
            case 'services':
                message = 'What services do you offer?';
                break;
            case 'support':
                message = 'I need IT support';
                break;
            case 'consulting':
                message = 'I want a consultation';
                break;
        }
        chatInput.value = message;
        sendMessage();
    }
    
    function processMessage(message, context = {}) {
        const lowerMessage = message.toLowerCase();
        
        // Add privacy policy link to responses
        const privacyLink = '<a href="/privacy-policy" target="_blank" class="chat-link-btn">Privacy Policy</a>';
        
        // Service-related queries
        if (lowerMessage.includes('service') || lowerMessage.includes('what do you') || lowerMessage.includes('offer')) {
            return createResponseWithActions(
                `We offer three main IT services:`,
                [
                    { text: 'IT Support Services', url: '/services/it-support', primary: true },
                    { text: 'IT Project Management', url: '/services/it-project-management', primary: true },
                    { text: 'IT Consulting', url: '/services/it-consulting', primary: true }
                ],
                'Which service would you like to learn more about?'
            );
        }
        
        // IT Support queries
        if (lowerMessage.includes('support') || lowerMessage.includes('help desk') || lowerMessage.includes('troubleshoot') || lowerMessage.includes('technical')) {
            return createResponseWithActions(
                `Our IT Support Services provide ongoing technical assistance to keep your business running smoothly.`,
                [
                    { text: 'Learn More About IT Support', url: '/services/it-support', primary: true },
                    { text: 'Contact Us for Support', url: '/contact', primary: false }
                ],
                'We offer help desk support, remote assistance, network management, and proactive monitoring.'
            );
        }
        
        // Project Management queries
        if (lowerMessage.includes('project') || lowerMessage.includes('manage') || lowerMessage.includes('coordinate') || lowerMessage.includes('timeline')) {
            return createResponseWithActions(
                `Our IT Project Management Services ensure your projects are completed on time and within budget.`,
                [
                    { text: 'Learn More About Project Management', url: '/services/it-project-management', primary: true },
                    { text: 'Discuss Your Project', url: '/contact', primary: false }
                ],
                'We handle planning, vendor coordination, timeline control, and project oversight.'
            );
        }
        
        // Consulting queries
        if (lowerMessage.includes('consult') || lowerMessage.includes('advice') || lowerMessage.includes('recommend') || lowerMessage.includes('assessment') || lowerMessage.includes('guidance')) {
            return createResponseWithActions(
                `Our IT Consulting Services help you make informed technology decisions.`,
                [
                    { text: 'Learn More About Consulting', url: '/services/it-consulting', primary: true },
                    { text: 'Schedule a Consultation', url: '/contact', primary: false }
                ],
                'We provide independent assessments, technology planning, vendor reviews, and cost optimization.'
            );
        }
        
        // Pricing queries
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('pricing')) {
            return createResponseWithActions(
                `Our pricing is tailored to your specific needs and business size.`,
                [
                    { text: 'Contact Us for Pricing', url: '/contact', primary: true },
                    { text: 'View Our Services', url: '/services/it-support', primary: false }
                ],
                'We offer flexible service packages designed for small and mid-sized businesses. Let\'s discuss your requirements.'
            );
        }
        
        // Contact queries
        if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('get in touch')) {
            return createResponseWithActions(
                `We're here to help! You can reach us through:`,
                [
                    { text: 'Contact Form', url: '/contact', primary: true },
                    { text: 'Email: info@paxitechnologies.com', url: 'mailto:info@paxitechnologies.com', primary: false },
                    { text: 'Phone: +1 (234) 567-890', url: 'tel:+1234567890', primary: false }
                ],
                'Choose the best way to reach us.'
            );
        }
        
        // Healthcare queries
        if (lowerMessage.includes('healthcare') || lowerMessage.includes('medical') || lowerMessage.includes('hipaa') || lowerMessage.includes('hospital')) {
            return createResponseWithActions(
                `Yes! We have deep experience serving healthcare organizations.`,
                [
                    { text: 'Learn About Our Services', url: '/services/it-support', primary: true },
                    { text: 'Contact Us', url: '/contact', primary: false }
                ],
                'We understand HIPAA compliance, patient data security, and critical system availability requirements.'
            );
        }
        
        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')) {
            return createResponseWithActions(
                `Hello! 👋 I'm here to help you find the right IT service for your business.`,
                [
                    { text: 'View Our Services', url: '/services/it-support', primary: true },
                    { text: 'Contact Us', url: '/contact', primary: false }
                ],
                'What would you like to know about our services?'
            );
        }
        
        // Default response
        return createResponseWithActions(
            `I understand you're asking about "${message}".`,
            [
                { text: 'View Our Services', url: '/services/it-support', primary: true },
                { text: 'Contact Us', url: '/contact', primary: false }
            ],
            `We specialize in IT Support, Project Management, and Consulting for small and mid-sized businesses. How can I help you?\n\nView our ${privacyLink} for information about how we handle your data.`
        );
    }
    
    function createResponseWithActions(mainText, actions, additionalText) {
        let html = `<p>${mainText}</p>`;
        
        if (additionalText) {
            html += `<p>${additionalText}</p>`;
        }
        
        if (actions && actions.length > 0) {
            html += `<div class="chat-action-buttons">`;
            actions.forEach(action => {
                const className = action.primary ? 'chat-action-btn' : 'chat-action-btn secondary';
                html += `<a href="${action.url}" class="${className}" target="${action.url.startsWith('http') ? '_blank' : '_self'}">${action.text}</a>`;
            });
            html += `</div>`;
        }
        
        return html;
    }
}
