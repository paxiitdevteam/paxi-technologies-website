// API Client for Backend Integration
// Handles all API communication

class APIClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || '';
        this.timeout = config.timeout || 10000;
        this.retries = config.retries || 3;
        this.endpoints = config.endpoints || {};
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Add authentication if available
        const token = this.getAuthToken();
        if (token) {
            mergedOptions.headers['Authorization'] = `Bearer ${token}`;
        }
        
        let lastError;
        for (let attempt = 0; attempt < this.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...mergedOptions,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return { success: true, data };
                
            } catch (error) {
                lastError = error;
                if (attempt < this.retries - 1) {
                    // Wait before retry (exponential backoff)
                    await this.delay(1000 * (attempt + 1));
                }
            }
        }
        
        return { success: false, error: lastError.message };
    }
    
    async sendChatMessage(message, context = {}) {
        return await this.request(this.endpoints.chat || '/api/chat/message', {
            method: 'POST',
            body: JSON.stringify({
                message,
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                page: window.location.pathname
            })
        });
    }
    
    async getChatHistory(sessionId) {
        return await this.request(`${this.endpoints.history || '/api/chat/history'}/${sessionId}`, {
            method: 'GET'
        });
    }
    
    async submitContactForm(formData) {
        return await this.request(this.endpoints.contact || '/api/contact/submit', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }
    
    async trackEvent(eventName, eventData) {
        return await this.request(this.endpoints.analytics || '/api/analytics/track', {
            method: 'POST',
            body: JSON.stringify({
                event: eventName,
                data: eventData,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            })
        });
    }
    
    getAuthToken() {
        // Get auth token from localStorage or cookie
        return localStorage.getItem('api_token') || getCookie('api_token');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize API client (will be configured from config.js)
let apiClient = null;

function initAPIClient() {
    // Try to load config
    if (typeof window !== 'undefined' && window.config && window.config.api && window.config.api.baseUrl) {
        apiClient = new APIClient(window.config.api);
        window.apiClient = apiClient; // Make available globally
    }
    return apiClient;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.APIClient = APIClient;
    window.initAPIClient = initAPIClient;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, initAPIClient };
}
