// Newsletter subscription
async function subscribeToNewsletter(email) {
    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Important for authentication
        });

        const data = await response.json();
        
        if (response.ok) {
            showNotification('Success! You\'ve been subscribed to our newsletter.', 'success');
        } else if (response.status === 401) {
            // Redirect to login page if not authenticated
            window.location.href = '/login.html';
        } else {
            showNotification(data.error || 'Failed to subscribe', 'error');
        }
    } catch (error) {
        showNotification('Error connecting to server', 'error');
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const subscribeForm = document.getElementById('subscribe-form');
    const emailInput = document.getElementById('subscribe-email');

    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Please enter your email address', 'error');
                return;
            }
            
            await subscribeToNewsletter(email);
            emailInput.value = ''; // Clear input after successful subscription
        });
    }
});

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
