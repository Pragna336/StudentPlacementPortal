// Initialize Lucide icons
lucide.createIcons();

// Navigation function
function navigateTo(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Re-initialize icons for the new screen
        lucide.createIcons();
        
        // Update URL hash
        window.location.hash = screenId;
        
        // Scroll to top
        targetScreen.scrollTop = 0;
    }
}

// Handle initial load and hash changes
function handleRouting() {
    const hash = window.location.hash.substring(1);
    
    if (hash) {
        navigateTo(hash);
    } else {
        // Show splash screen by default
        navigateTo('splash');
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
            navigateTo('login');
        }, 3000);
    }
}

// Form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            navigateTo('home');
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            navigateTo('home');
        });
    }
    
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            navigateTo('admin');
        });
    }
    
    // Handle routing
    handleRouting();
});

// Listen for hash changes
window.addEventListener('hashchange', handleRouting);

// Tab functionality for interview screen
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab-btn')) {
        const tabName = e.target.dataset.tab;
        
        // Remove active class from all tabs
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        // Hide all tab contents
        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => content.classList.remove('active'));
        
        // Show target content
        const targetContent = document.getElementById(`${tabName}-content`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Re-initialize icons
        lucide.createIcons();
    }
});

// Accordion functionality
document.addEventListener('click', function(e) {
    const header = e.target.closest('.accordion-header');
    if (header) {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close all accordion items in the same accordion
        const accordion = item.parentElement;
        const items = accordion.querySelectorAll('.accordion-item');
        items.forEach(i => i.classList.remove('active'));
        
        // Toggle clicked item
        if (!isActive) {
            item.classList.add('active');
        }
        
        // Re-initialize icons
        lucide.createIcons();
    }
});

// Update active bottom nav based on current screen
function updateBottomNav() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen) return;
    
    const screenId = currentScreen.id;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Set active nav item based on screen
    const navMap = {
        'home': 0,
        'aptitude': 1,
        'coding': 1,
        'interview': 1,
        'mock-test': 1,
        'progress': 2,
        'profile': 3
    };
    
    const activeIndex = navMap[screenId];
    if (activeIndex !== undefined && navItems[activeIndex]) {
        navItems[activeIndex].classList.add('active');
    }
}

// Update nav on screen change
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
            updateBottomNav();
        }
    });
});

// Observe all screens for class changes
document.querySelectorAll('.screen').forEach(screen => {
    observer.observe(screen, { attributes: true });
});

// Mock timer functionality for test
let timeLeft = 24 * 60 + 35; // 24:35 in seconds

function updateTimer() {
    const timerElement = document.querySelector('.timer strong');
    if (!timerElement) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft > 0) {
        timeLeft--;
    }
}

// Start timer when on test screen
setInterval(function() {
    const testScreen = document.getElementById('test-question');
    if (testScreen && testScreen.classList.contains('active')) {
        updateTimer();
    }
}, 1000);

// Handle radio button selection for test questions
document.addEventListener('change', function(e) {
    if (e.target.type === 'radio' && e.target.name === 'answer') {
        // Re-initialize icons to update the radio button appearance
        lucide.createIcons();
    }
});

// Add SVG gradient definition dynamically for circular progress
function addGradientDefinition() {
    const charts = document.querySelectorAll('.circular-chart');
    charts.forEach(chart => {
        if (!chart.querySelector('defs')) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', 'gradient');
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#FFB347');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#9370DB');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            chart.appendChild(defs);
        }
    });
}

// Add gradient definitions on load and when needed
window.addEventListener('load', addGradientDefinition);

// Re-add gradients when navigating to screens with circular charts
const originalNavigateTo = navigateTo;
navigateTo = function(screenId) {
    originalNavigateTo(screenId);
    setTimeout(addGradientDefinition, 100);
};

// Initialize icons on initial load
window.addEventListener('load', function() {
    lucide.createIcons();
});
