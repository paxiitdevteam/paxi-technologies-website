// Configuration Example File
// Copy this to config.js and fill in your actual values
// config.js is in .gitignore and will not be committed

export const config = {
    // OpenAI API Configuration (for AI features)
    openai: {
        apiKey: 'your-openai-api-key-here',
        model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo'
        temperature: 0.7,
        maxTokens: 500
    },
    
    // Live Chat Service Configuration
    liveChat: {
        // Intercom
        intercom: {
            appId: 'your-intercom-app-id',
            enabled: false
        },
        
        // Drift
        drift: {
            accountId: 'your-drift-account-id',
            enabled: false
        },
        
        // Zendesk Chat
        zendesk: {
            key: 'your-zendesk-key',
            enabled: false
        }
    },
    
    // Backend API Configuration
    api: {
        baseUrl: 'https://api.paxitechnologies.com', // Your backend API URL
        endpoints: {
            chat: '/api/chat/message',
            history: '/api/chat/history',
            contact: '/api/contact/submit',
            analytics: '/api/analytics/track'
        },
        timeout: 10000, // 10 seconds
        retries: 3
    },
    
    // Analytics Configuration
    analytics: {
        googleAnalytics: {
            trackingId: 'G-XXXXXXXXXX', // Your GA4 tracking ID
            enabled: false
        },
        // Add other analytics services as needed
    },
    
    // Email Service Configuration
    email: {
        service: 'sendgrid', // or 'mailchimp', 'ses', etc.
        apiKey: 'your-email-service-api-key',
        fromEmail: 'noreply@paxitechnologies.com',
        fromName: 'Paxi Technologies'
    }
};
