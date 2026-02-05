// Configuration File
// This file contains default configuration with no sensitive data
// All features are disabled by default - enable and add API keys as needed

export const config = {
    // OpenAI API Configuration (for AI features)
    openai: {
        apiKey: '', // Add your OpenAI API key here when ready
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
        enabled: false // Set to true when API key is added
    },
    
    // Live Chat Service Configuration
    liveChat: {
        // Intercom
        intercom: {
            appId: '', // Add your Intercom App ID here when ready
            enabled: false
        },
        
        // Drift
        drift: {
            accountId: '', // Add your Drift Account ID here when ready
            enabled: false
        },
        
        // Zendesk Chat
        zendesk: {
            key: '', // Add your Zendesk key here when ready
            enabled: false
        }
    },
    
    // Backend API Configuration
    api: {
        baseUrl: '', // Add your backend API URL here when ready
        endpoints: {
            chat: '/api/chat/message',
            history: '/api/chat/history',
            contact: '/api/contact/submit',
            analytics: '/api/analytics/track'
        },
        timeout: 10000, // 10 seconds
        retries: 3,
        enabled: false // Set to true when baseUrl is configured
    },
    
    // Analytics Configuration
    analytics: {
        googleAnalytics: {
            trackingId: '', // Add your GA4 tracking ID here when ready
            enabled: false
        }
    },
    
    // Email Service Configuration
    email: {
        service: 'sendgrid',
        apiKey: '', // Add your email service API key here when ready
        fromEmail: 'noreply@paxitechnologies.com',
        fromName: 'Paxi Technologies'
    }
};
