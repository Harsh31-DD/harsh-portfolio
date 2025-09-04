// Professional Modern Portfolio - JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Section reveals and animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all sections for animations
    const sections = document.querySelectorAll('.project-block, .service-card, .about, .portfolio, .services, .contact');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Typing animation for hero tagline
    const typingText = document.getElementById('typing-text');
    const taglines = [
        "Creating visually stunning designs that bring your ideas to life.",
        "Transforming concepts into beautiful visual realities.",
        "Where creativity meets innovation in design.",
        "Crafting memorable experiences through thoughtful design."
    ];

    let taglineIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentTagline = taglines[taglineIndex];

        if (!isDeleting) {
            typingText.textContent = currentTagline.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentTagline.length) {
                isDeleting = true;
                setTimeout(typeWriter, 2000); // Pause at end
                return;
            }
        } else {
            typingText.textContent = currentTagline.substring(0, charIndex);
            charIndex--;

            if (charIndex < 0) {
                isDeleting = false;
                taglineIndex = (taglineIndex + 1) % taglines.length;
                setTimeout(typeWriter, 500); // Pause before next tagline
                return;
            }
        }

        setTimeout(typeWriter, isDeleting ? 50 : 100);
    }

    setTimeout(typeWriter, 1000); // Start typing after initial load

    // Enhanced mobile menu functionality
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const bars = document.querySelectorAll('.bar');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;

        hamburger.classList.toggle('active', isMenuOpen);
        navMenu.classList.toggle('active', isMenuOpen);

        bars.forEach((bar, index) => {
            if (isMenuOpen) {
                if (index === 0) {
                    bar.style.transform = 'translateY(11px) rotate(45deg)';
                } else if (index === 1) {
                    bar.style.opacity = '0';
                } else {
                    bar.style.transform = 'translateY(-11px) rotate(-45deg)';
                }
            } else {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            }
        });

        // Prevent body scroll when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    }

    hamburger?.addEventListener('click', toggleMenu);

    // Close menu when clicking outside or on a link
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            if (isMenuOpen) {
                toggleMenu();
            }
        }
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu after navigation
                if (isMenuOpen) {
                    toggleMenu();
                }

                // Update active link (remove this line to keep manual control)
            }
        });
    });

    // Sticky header with enhanced styling
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    let headerVisible = true;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class for style changes
        if (scrollTop > 100) {
            header.classList.add('scrolled');
            header.style.boxShadow = '0 8px 32px rgba(37, 99, 235, 0.1)';
        } else {
            header.classList.remove('scrolled');
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }

        // Hide/show header on scroll (optional enhancement)
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down - hide header
            if (headerVisible) {
                header.style.transform = 'translateY(-100%)';
                headerVisible = false;
            }
        } else {
            // Scrolling up or at top - show header
            if (!headerVisible) {
                header.style.transform = 'translateY(0)';
                headerVisible = true;
            }
        }

        lastScrollTop = scrollTop;
    });

    // Active navigation link based on scroll position
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;

        navLinks.forEach(link => {
            const section = document.querySelector(link.getAttribute('href'));
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const sectionBottom = sectionTop + sectionHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initialize on load

    // Contact form enhancement with validation
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, textarea');
        const submitButton = contactForm.querySelector('.submit-button');

        // Enhanced input focus effects
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.transform = 'translateY(-3px)';
                this.style.borderColor = 'var(--royal-blue)';
            });

            input.addEventListener('blur', function() {
                this.style.transform = 'translateY(0)';
                if (!this.value.trim()) {
                    this.style.borderColor = 'var(--gray-300)';
                }
            });

            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.style.borderColor = 'var(--royal-blue)';
                } else {
                    this.style.borderColor = 'var(--gray-300)';
                }
            });
        });

        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            submitButton.style.opacity = '0.7';

            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            // Replace with your backend URL (e.g., 'https://your-app.herokuapp.com')
            const API_URL = 'https://your-backend-url.com/contact';

            // Send POST request to backend
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Thank you for your message! I will get back to you soon.');
                contactForm.reset();

                // Reset input styles
                inputs.forEach(input => {
                    input.style.borderColor = 'var(--gray-300)';
                    input.style.transform = 'translateY(0)';
                });
            })
            .catch(error => {
                console.error('Form submission error:', error);
                alert('Sorry, there was an error sending your message. Please try again later.');
            })
            .finally(() => {
                submitButton.textContent = submitText;
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
            });
        });
    }

    // Portfolio hover effects for new project-block structure
    const projectBlocks = document.querySelectorAll('.project-block');
    
    projectBlocks.forEach(block => {
        const media = block.querySelector('.project-media-large');
        const image = media?.querySelector('img') || media?.querySelector('video');
    
        if (image) {
            block.addEventListener('mouseenter', function() {
                image.style.transform = 'scale(1.02)';
            });
    
            block.addEventListener('mouseleave', function() {
                image.style.transform = 'scale(1)';
            });
        }
    });
    
    // Progressive loading animation for project blocks
    function animatePortfolioItems() {
        const items = document.querySelectorAll('.project-block');

        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Trigger portfolio animation when section is visible
    const portfolioSection = document.querySelector('.portfolio');
    if (portfolioSection) {
        observer.observe(portfolioSection);
        portfolioSection.addEventListener('animationstart', function() {
            if (!this.dataset.animated) {
                this.dataset.animated = 'true';
                setTimeout(animatePortfolioItems, 500);
            }
        });
    }

    // Services cards hover and animation enhancement
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        const icon = card.querySelector('.service-icon');

        card.addEventListener('mouseenter', function() {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        });

        card.addEventListener('mouseleave', function() {
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Magnetic hover effect for buttons
    function magneticEffect(element) {
        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        element.addEventListener('mouseleave', function() {
            element.style.transform = 'translate(0, 0)';
        });
    }

    // Apply magnetic effect to buttons and interactive elements
    const magneticElements = document.querySelectorAll('.cta-button, .submit-button, .social-link, .service-icon');
    magneticElements.forEach(element => {
        magneticEffect(element);
    });

    // Parallax effect for background elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroShape = document.querySelector('.hero-shape');

        if (heroShape) {
            const rate = scrolled * -0.5;
            heroShape.style.transform = `translateY(${rate}px)`;
        }
    });

    // Scroll progress indicator
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    scrollProgress.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(scrollProgress);

    const scrollProgressBar = scrollProgress.querySelector('.scroll-progress-bar');

    function updateScrollProgress() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;

        scrollProgressBar.style.width = scrollPercentage + '%';
    }

    window.addEventListener('scroll', updateScrollProgress);

    // Enhanced accessibility features
    const focusableElements = document.querySelectorAll('a, button, input, textarea');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--royal-blue)';
            this.style.outlineOffset = '2px';
        });

        element.addEventListener('blur', function() {
            this.style.outline = 'none';
            this.style.outlineOffset = 'none';
        });
    });

    // Keyboard navigation for mobile menu
    if (hamburger) {
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        navMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                toggleMenu();
            }
        });
    }

    // Loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');

        // Trigger initial animations
        setTimeout(() => {
            updateActiveNav();
            if (portfolioSection) {
                animatePortfolioItems();
            }
        }, 500);
    });

    // Performance optimization - debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    window.addEventListener('scroll', debounce(updateScrollProgress, 10));
    window.addEventListener('scroll', debounce(updateActiveNav, 50));

    // Social media links hover enhancement
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.5)';
        });

        link.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
        });
    });

    // Dynamic copyright year
    const currentYear = new Date().getFullYear();
    const footerText = document.querySelector('.footer-bottom p');
    if (footerText) {
        footerText.innerHTML = footerText.innerHTML.replace('2024', currentYear);
    }

    // Tool items hover effects
    const toolItems = document.querySelectorAll('.tool-item');
    toolItems.forEach(item => {
        const icon = item.querySelector('i');

        item.addEventListener('mouseenter', function() {
            icon.style.color = 'var(--accent-blue)';
            this.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.1))';
        });

        item.addEventListener('mouseleave', function() {
            icon.style.color = 'var(--royal-blue)';
            this.style.background = 'var(--gray-100)';
        });
    });

    // Scroll indicator for hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection && window.innerHeight > 600) {
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = '<div class="scroll-mouse"></div>';
        document.body.appendChild(scrollIndicator);

        // Show/hide scroll indicator based on scroll position
        function toggleScrollIndicator() {
            const scrollTop = window.pageYOffset;
            if (scrollTop < 100) {
                scrollIndicator.classList.add('visible');
            } else {
                scrollIndicator.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', toggleScrollIndicator);
        toggleScrollIndicator();
    }
});