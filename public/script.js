// Global variables
let grievances = [];
let isLoggedIn = false;
let isAdmin = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Initialize slider
    initializeSlider();
    
    // Show login page by default
    showPage('loginPage');
}

function setupEventListeners() {
    // Grievance form submission
    const grievanceForm = document.getElementById('grievanceForm');
    if (grievanceForm) {
        grievanceForm.addEventListener('submit', handleGrievanceSubmit);
    }
    
    // Slider change event
    const slider = document.getElementById('upsetLevel');
    if (slider) {
        slider.addEventListener('input', updateSliderValue);
    }
    
    // Enter key login
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && document.getElementById('loginPage').classList.contains('active')) {
            login();
        }
    });
}

function initializeSlider() {
    const slider = document.getElementById('upsetLevel');
    if (slider) {
        updateSliderValue();
    }
}

function updateSliderValue() {
    const slider = document.getElementById('upsetLevel');
    const emojiSpan = document.getElementById('sliderEmoji');
    const textSpan = document.getElementById('sliderText');
    
    if (!slider || !emojiSpan || !textSpan) return;
    
    const value = parseInt(slider.value);
    
    const emotions = {
        1: { emoji: '😊', text: 'Not upset at all' },
        2: { emoji: '🙂', text: 'Slightly bothered' },
        3: { emoji: '😐', text: 'A little upset' },
        4: { emoji: '😕', text: 'Somewhat upset' },
        5: { emoji: '😔', text: 'Moderately upset' },
        6: { emoji: '😞', text: 'Pretty upset' },
        7: { emoji: '😠', text: 'Quite upset' },
        8: { emoji: '😡', text: 'Very upset' },
        9: { emoji: '🤬', text: 'Extremely upset' },
        10: { emoji: '😤', text: 'Furious!' }
    };
    
    const emotion = emotions[value] || emotions[5];
    emojiSpan.textContent = emotion.emoji;
    textSpan.textContent = emotion.text;
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    // Check for admin login
    if (username.toLowerCase() === 'jacob' && password === 'admin123') {
        isAdmin = true;
        isLoggedIn = true;
        showPage('adminPage');
        loadGrievances();
        showNotification('Welcome, Jacob! Admin access granted.', 'success');
        return;
    }
    
    // Check for user login
    if (username.toLowerCase() === 'dheshnaa' && password === 'dheshnaa123') {
        isLoggedIn = true;
        isAdmin = false;
        showPage('portalPage');
        showNotification('Welcome, Dheshnaa! ❤️', 'success');
        return;
    }
    
    // Invalid credentials
    showNotification('Invalid username or password. Try:\n- Username: dheshnaa, Password: dheshnaa123\n- Username: jacob, Password: admin123', 'error');
}

function logout() {
    isLoggedIn = false;
    isAdmin = false;
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showPage('loginPage');
    showNotification('You have been logged out successfully', 'success');
}

async function handleGrievanceSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('grievanceTitle').value.trim();
    const text = document.getElementById('grievanceText').value.trim();
    const upsetLevel = parseInt(document.getElementById('upsetLevel').value);
    
    if (!title || !text) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        // Submit to backend API
        const response = await fetch('/api/grievances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                text: text,
                upsetLevel: upsetLevel
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Clear form
            document.getElementById('grievanceForm').reset();
            initializeSlider();
            
            // Show thank you page
            showPage('thankYouPage');
            
            showNotification('Grievance submitted successfully! Jacob will be notified via email.', 'success');
        } else {
            showNotification(result.error || 'Failed to submit grievance', 'error');
        }
    } catch (error) {
        console.error('Error submitting grievance:', error);
        showNotification('Failed to submit grievance. Please try again.', 'error');
    }
}



function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function goBackToPortal() {
    showPage('portalPage');
}

async function loadGrievances() {
    const grievancesList = document.getElementById('grievancesList');
    if (!grievancesList) return;
    
    try {
        const response = await fetch('/api/grievances');
        const fetchedGrievances = await response.json();
        
        if (response.ok) {
            grievances = fetchedGrievances;
        } else {
            console.error('Failed to load grievances:', fetchedGrievances);
        }
    } catch (error) {
        console.error('Error loading grievances:', error);
    }
    
    if (grievances.length === 0) {
        grievancesList.innerHTML = '<div class="no-grievances">No grievances yet. Dheshnaa hasn\'t submitted any complaints! 😊</div>';
        return;
    }
    
    // Sort grievances by timestamp (newest first)
    const sortedGrievances = [...grievances].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    grievancesList.innerHTML = sortedGrievances.map(grievance => `
        <div class="grievance-item">
            <h3>${escapeHtml(grievance.title)}</h3>
            <p>${escapeHtml(grievance.text)}</p>
            <div class="grievance-meta">
                <span>Submitted: ${grievance.dateString}</span>
                <div class="upset-level">
                    <span class="upset-emoji">${getEmoji(grievance.upsetLevel)}</span>
                    <span>Upset Level: ${grievance.upsetLevel}/10</span>
                </div>
            </div>
            <div class="response-section">
                ${grievance.response ? `
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <strong>Your Response:</strong><br>
                        ${escapeHtml(grievance.response)}
                        <small style="display: block; margin-top: 5px; color: #666;">
                            Responded on: ${grievance.responseDate}
                        </small>
                    </div>
                ` : ''}
                <textarea id="response-${grievance.id}" placeholder="Write your response to Dheshnaa..." style="margin-bottom: 10px;">${grievance.response || ''}</textarea>
                <button onclick="respondToGrievance(${grievance.id})" class="btn btn-primary">
                    <i class="fas fa-reply"></i> ${grievance.response ? 'Update Response' : 'Send Response'}
                </button>
            </div>
        </div>
    `).join('');
}

async function respondToGrievance(grievanceId) {
    const responseTextarea = document.getElementById(`response-${grievanceId}`);
    const responseText = responseTextarea.value.trim();
    
    if (!responseText) {
        showNotification('Please write a response before sending', 'error');
        return;
    }
    
    try {
        const apiResponse = await fetch(`/api/grievances/${grievanceId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                response: responseText
            })
        });
        
        const result = await apiResponse.json();
        
        if (apiResponse.ok && result.success) {
            // Reload grievances display
            await loadGrievances();
            showNotification('Response sent successfully! Dheshnaa will see your message.', 'success');
        } else {
            showNotification(result.error || 'Failed to send response', 'error');
        }
    } catch (error) {
        console.error('Error responding to grievance:', error);
        showNotification('Failed to send response. Please try again.', 'error');
    }
}

function getEmoji(upsetLevel) {
    const emotions = {
        1: '😊', 2: '🙂', 3: '😐', 4: '😕', 5: '😔',
        6: '😞', 7: '😠', 8: '😡', 9: '🤬', 10: '😤'
    };
    return emotions[upsetLevel] || '😐';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
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
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function checkLoginStatus() {
    // In a real application, you might check for stored authentication tokens
    // For now, we'll just start with the login page
    showPage('loginPage');
}

// Helper function to access grievances from console (for debugging)
function getGrievances() {
    return grievances;
}

// Helper function to clear all grievances (for testing)
async function clearAllGrievances() {
    if (confirm('Are you sure you want to delete all grievances? This cannot be undone.')) {
        try {
            // Note: You'd need to implement this endpoint in the backend if needed
            // For now, just reload to show current state
            await loadGrievances();
            showNotification('Please manually delete grievances.json file on server to clear all grievances', 'info');
        } catch (error) {
            console.error('Error clearing grievances:', error);
            showNotification('Failed to clear grievances', 'error');
        }
    }
}

// Admin shortcut (press Ctrl+Shift+A on login page)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A' && document.getElementById('loginPage').classList.contains('active')) {
        document.getElementById('username').value = 'jacob';
        document.getElementById('password').value = 'admin123';
        showNotification('Admin credentials auto-filled', 'info');
    }
});

// User shortcut (press Ctrl+Shift+D on login page)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D' && document.getElementById('loginPage').classList.contains('active')) {
        document.getElementById('username').value = 'dheshnaa';
        document.getElementById('password').value = 'dheshnaa123';
        showNotification('User credentials auto-filled', 'info');
    }
}); 
