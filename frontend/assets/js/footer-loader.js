// Optimized footer loader
async function loadFooter() {
    const footerPlaceholder = document.createElement('div');
    footerPlaceholder.innerHTML = '<div class="footer-placeholder" style="height: 400px; background: linear-gradient(135deg, rgba(13, 17, 23, 0.98), rgba(23, 32, 47, 0.98));"></div>';
    document.body.appendChild(footerPlaceholder);

    try {
        const cachedFooter = sessionStorage.getItem('footerContent');
        if (cachedFooter) {
            footerPlaceholder.innerHTML = cachedFooter;
            return;
        }

        const response = await fetch('/components/footer.html');
        const data = await response.text();
        footerPlaceholder.innerHTML = data;
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
