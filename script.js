// ============================================
// SHREE SHYAM ECO SYSTEMS - PREMIUM CORPORATE WEBSITE
// JavaScript Functionality
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initPreloader();
    initHeader();
    initMobileMenu();
    initThemeToggle();
    initCounters();
    initAOS();
    initAchievementsSlider();
    initSmoothScroll();
    
    // Robust media initialization
    function ensureMediaReady() {
      if (typeof window.openMediaModal === 'function') {
        console.log('✅ Media system ready');
        window.renderMediaGallery();
        return;
      }
      setTimeout(ensureMediaReady, 50);
    }
    ensureMediaReady();
});

// ============================================
// PRELOADER
// ============================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                preloader.classList.add('hidden');
            }, 2000);
        });
    }
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================
function initHeader() {
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const nav = document.getElementById('nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function() {
            menuBtn.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !nav.contains(e.target)) {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }
}

// ============================================
// DARK MODE TOGGLE
// ============================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// ============================================
// ANIMATED COUNTERS
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length > 0) {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateCounter(counter, target);
                    counterObserver.unobserve(counter);
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const current = Math.floor(easeOutQuart * target);
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatNumber(target);
        }
    }
    
    requestAnimationFrame(update);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
        return num.toLocaleString();
    }
    return num.toString();
}

// ============================================
// AOS (ANIMATE ON SCROLL) INITIALIZATION
// ============================================
function initAOS() {
    const aosElements = document.querySelectorAll('[data-aos]');
    
    if (aosElements.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const aosObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);
        
        aosElements.forEach(el => {
            aosObserver.observe(el);
        });
    }
}

// ============================================
// ACHIEVEMENTS SLIDER
// ============================================
function initAchievementsSlider() {
    const slider = document.getElementById('achievementsSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (slider) {
        let scrollAmount = 0;
        const cardWidth = 330;
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                scrollAmount -= cardWidth;
                if (scrollAmount < 0) {
                    scrollAmount = slider.scrollWidth - slider.clientWidth;
                }
                slider.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                scrollAmount += cardWidth;
                if (scrollAmount > slider.scrollWidth - slider.clientWidth) {
                    scrollAmount = 0;
                }
                slider.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
        }
        
        // Auto-scroll
        let autoScroll = setInterval(function() {
            scrollAmount += cardWidth;
            if (scrollAmount > slider.scrollWidth - slider.clientWidth) {
                scrollAmount = 0;
            }
            slider.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }, 5000);
        
        // Pause on hover
        slider.addEventListener('mouseenter', function() {
            clearInterval(autoScroll);
        });
        
        slider.addEventListener('mouseleave', function() {
            autoScroll = setInterval(function() {
                scrollAmount += cardWidth;
                if (scrollAmount > slider.scrollWidth - slider.clientWidth) {
                    scrollAmount = 0;
                }
                slider.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }, 5000);
        });
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href !== '#stats') {
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// CONTACT FORM VALIDATION
// ============================================
function validateForm(formId) {
    const form = document.getElementById(formId);
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                // Show success message
                showAlert('success', 'Thank you for your inquiry. We will get back to you soon!');
                form.reset();
            }
        });
        
        // Validate on blur
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateInput(this);
                }
            });
        });
    }
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    
    // Remove previous error
    input.classList.remove('error');
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
    
    // Check required
    if (input.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    // Check email
    if (input.type === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            isValid = false;
        }
    }
    
    // Check phone
    if (input.type === 'tel' && value) {
        const phonePattern = /^[0-9]{10,}$/;
        if (!phonePattern.test(value.replace(/\s/g, ''))) {
            isValid = false;
        }
    }
    
    if (!isValid) {
        input.classList.add('error');
        const errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Please enter a valid value';
        errorMessage.style.color = '#dc2626';
        errorMessage.style.fontSize = '12px';
        input.parentElement.appendChild(errorMessage);
    }
    
    return isValid;
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(function() {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() {
            alert.remove();
        }, 300);
    }, 3000);
}

// ============================================
// REVENUE CHART (for Investors Page)
// ============================================
function initRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                datasets: [{
                    label: 'Projected Revenue (Crores)',
                    data: [15, 28, 42, 58, 75],
                    borderColor: '#064E3B',
                    backgroundColor: 'rgba(6, 78, 59, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#064E3B',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: "'DM Sans', sans-serif",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleFont: {
                            family: "'DM Sans', sans-serif",
                            size: 14
                        },
                        bodyFont: {
                            family: "'DM Sans', sans-serif",
                            size: 13
                        },
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: "'DM Sans', sans-serif",
                                size: 11
                            },
                            callback: function(value) {
                                return '₹' + value + ' Cr';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: "'DM Sans', sans-serif",
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
}

// ============================================
// TIMELINE ANIMATION
// ============================================
function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length > 0) {
        const observerOptions = {
            threshold: 0.2
        };
        
        const timelineObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
    }
}

// ============================================
// PARALLAX EFFECT
// ============================================
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = el.getAttribute('data-parallax') || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
}

// ============================================
// SCROLL TO TOP BUTTON
// ============================================
function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #064E3B;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Add CSS for scroll to top
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initScrollToTop();
    
    // Initialize form validation if on contact page
    validateForm('contactForm');
    
    // Initialize revenue chart if on investors page
    if (document.getElementById('revenueChart')) {
        initRevenueChart();
    }
    
    // Initialize timeline if on about page
    initTimeline();
});
