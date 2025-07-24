// Profile Page JavaScript
'use strict';

// Global variables
let isResourceChartBar = true;
let isThreatChartPie = true;
let resourceChart, threatChart;

// Notification function
function showNotification(message, type = 'error') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Profile picture upload functionality
function initializeProfileUpload() {
    const uploadInput = document.getElementById('profile-upload');
    if (!uploadInput) return;

    uploadInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePicture', file);
            
            try {
                const response = await fetch('/upload-profile-picture', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    // Update all profile pictures
                    const profilePic = document.getElementById('profile-pic');
                    const profilePicLarge = document.getElementById('profile-pic-large');
                    const sidebarProfilePic = document.getElementById('sidebar-profile-pic');
                    
                    if (profilePic) profilePic.src = result.profilePicture;
                    if (profilePicLarge) profilePicLarge.src = result.profilePicture;
                    if (sidebarProfilePic) sidebarProfilePic.src = result.profilePicture;
                    
                    showNotification('Profile picture updated successfully!', 'success');
                } else {
                    showNotification('Failed to upload profile picture');
                }
            } catch (err) {
                console.error('Upload error:', err);
                showNotification('Error uploading profile picture');
            }
        }
    });
}

// Live resource data simulation
let liveResourceData = {
    cpu: 67,
    memory: 84,
    network: 42,
    storage: 78
};

// Animate resource values
function updateResourceValues() {
    Object.keys(liveResourceData).forEach(key => {
        const variation = (Math.random() - 0.5) * 10;
        liveResourceData[key] = Math.max(0, Math.min(100, liveResourceData[key] + variation));
        
        const element = document.getElementById(`${key}-value`);
        if (element) {
            element.textContent = Math.round(liveResourceData[key]) + '%';
            
            // Update color based on value
            if (liveResourceData[key] > 80) {
                element.style.color = '#ef4444';
            } else if (liveResourceData[key] > 60) {
                element.style.color = '#f59e0b';
            } else {
                element.style.color = '#10b981';
            }
        }
    });
    
    // Update charts
    if (window.resourceChart && window.resourceChart.data) {
        window.resourceChart.data.datasets[0].data = Object.values(liveResourceData);
        window.resourceChart.update('none');
    }
}

// Interactive hover effects for resource items
function initializeResourceItemEffects() {
    document.querySelectorAll('.resource-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
            this.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
}

// Enhanced Resource Usage Chart with Live Data
function initializeResourceChart() {
    const ctx = document.getElementById('resourceChart');
    if (!ctx) {
        console.warn('Resource chart canvas not found');
        return;
    }

    try {
        const resourceData = {
            labels: ['CPU', 'Memory', 'Network', 'Storage'],
            datasets: [{
                label: 'Resource Usage (%)',
                data: [65, 80, 45, 70],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(249, 115, 22, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(147, 51, 234, 0.6)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(147, 51, 234, 1)'
                ],
                borderWidth: 2,
                hoverBackgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(147, 51, 234, 0.8)'
                ],
                hoverBorderWidth: 3
            }]
        };

        resourceChart = new Chart(ctx, {
            type: 'bar',
            data: resourceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'var(--accent)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.y}% (${context.parsed.y > 75 ? 'High' : context.parsed.y > 50 ? 'Medium' : 'Low'} Usage)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { family: 'Orbitron', size: 11 }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { family: 'Orbitron', size: 11 },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutCubic'
                },
                onHover: (event, activeElements) => {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                }
            }
        });

        // Store reference globally
        window.resourceChart = resourceChart;
        console.log('Resource chart initialized successfully');
    } catch (error) {
        console.error('Error initializing resource chart:', error);
    }
}

// Enhanced Threat Types Chart with Interactive Features
function initializeThreatChart() {
    const ctx = document.getElementById('threatChart');
    if (!ctx) {
        console.warn('Threat chart canvas not found');
        return;
    }

    try {
        const threatData = {
            labels: ['Phishing Attacks', 'Malware Detection', 'DDoS Attempts', 'Unauthorized Access', 'Data Breaches'],
            datasets: [{
                data: [35, 28, 18, 12, 7],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(249, 115, 22, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(147, 51, 234, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(147, 51, 234, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2,
                hoverBackgroundColor: [
                    'rgba(239, 68, 68, 0.9)',
                    'rgba(249, 115, 22, 0.9)',
                    'rgba(59, 130, 246, 0.9)',
                    'rgba(147, 51, 234, 0.9)',
                    'rgba(16, 185, 129, 0.9)'
                ],
                hoverBorderWidth: 3,
                hoverOffset: 15
            }]
        };

        threatChart = new Chart(ctx, {
            type: 'pie',
            data: threatData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { family: 'Orbitron', size: 10 },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'var(--accent)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} incidents (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeInOutCubic'
                },
                onHover: (event, activeElements) => {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                }
            }
        });

        // Store reference globally
        window.threatChart = threatChart;
        console.log('Threat chart initialized successfully');
    } catch (error) {
        console.error('Error initializing threat chart:', error);
    }
}

// Live Data Simulation
function updateChartData() {
    // Simulate live resource data
    if (resourceChart && resourceChart.data) {
        resourceChart.data.datasets[0].data = resourceChart.data.datasets[0].data.map(value => {
            const change = (Math.random() - 0.5) * 10;
            const newValue = Math.max(0, Math.min(100, value + change));
            return Math.round(newValue);
        });
        resourceChart.update('none');
    }

    // Simulate threat detection
    if (threatChart && threatChart.data) {
        const randomIncrease = Math.floor(Math.random() * 3);
        if (randomIncrease > 0) {
            const randomIndex = Math.floor(Math.random() * threatChart.data.datasets[0].data.length);
            threatChart.data.datasets[0].data[randomIndex] += randomIncrease;
            threatChart.update('none');
        }
    }
}

// Chart Toggle Functions
function toggleResourceChart() {
    if (!resourceChart) return;
    
    resourceChart.destroy();
    isResourceChartBar = !isResourceChartBar;
    
    const ctx = document.getElementById('resourceChart');
    const newChart = new Chart(ctx, {
        type: isResourceChartBar ? 'bar' : 'doughnut',
        data: resourceChart.data,
        options: resourceChart.options
    });
    
    resourceChart = newChart;
    window.resourceChart = newChart;
}

function toggleThreatChart() {
    if (!threatChart) return;
    
    threatChart.destroy();
    isThreatChartPie = !isThreatChartPie;
    
    const ctx = document.getElementById('threatChart');
    const newChart = new Chart(ctx, {
        type: isThreatChartPie ? 'pie' : 'bar',
        data: threatChart.data,
        options: threatChart.options
    });
    
    threatChart = newChart;
    window.threatChart = newChart;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeProfileUpload();
    initializeResourceItemEffects();
    
    // Initialize charts with slight delay for smooth rendering
    setTimeout(() => {
        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            initializeResourceChart();
            initializeThreatChart();
            
            // Start live updates after charts are ready
            setTimeout(() => {
                setInterval(updateResourceValues, 3000);
                setInterval(updateChartData, 3000);
            }, 500);
        });
    }, 100);
    
    // Optimize performance
    Chart.defaults.animation.duration = 1000;
    Chart.defaults.responsiveAnimationDuration = 500;
});
