// Optimized footer loader with error handling and placeholder support
async function loadFooter() {
    const footerContainer = document.getElementById('footer-placeholder') || document.createElement('div');
    footerContainer.id = 'footer-placeholder';
    
    // Show loading placeholder
    footerContainer.innerHTML = '<div class="footer-loading" style="height: 400px; background: linear-gradient(135deg, rgba(13, 17, 23, 0.98), rgba(23, 32, 47, 0.98));"><div class="loading-text">Loading footer...</div></div>';
    
    if (!document.getElementById('footer-placeholder')) {
        document.body.appendChild(footerContainer);
    }

    try {
        // Try to get cached footer first
        const cachedFooter = sessionStorage.getItem('footerContent');
        if (cachedFooter) {
            footerContainer.innerHTML = cachedFooter;
            return;
        }

        // Fetch fresh footer content
        const response = await fetch('/components/footer.html');
        if (!response.ok) throw new Error('Failed to load footer');
        
        const data = await response.text();
        footerContainer.innerHTML = data;
        sessionStorage.setItem('footerContent', data);
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Load footer when the main content is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}

// Optimize animations
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.style.willChange = 'transform';
        footer.style.transform = 'translateZ(0)';
    }
});
