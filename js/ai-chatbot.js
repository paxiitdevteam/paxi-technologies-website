// Advanced AI Chatbot Integration
// Supports OpenAI API integration for intelligent responses

class AIChatbot {
    constructor(config = {}) {
        this.apiKey = config.apiKey || '';
        this.model = config.model || 'gpt-4o-mini';
        this.temperature = config.temperature || 0.7;
        this.maxTokens = config.maxTokens || 500;
        this.enabled = config.apiKey && config.apiKey.length > 0;
        this.conversationHistory = [];
    }
    
    async generateResponse(userMessage, context = {}) {
        if (!this.enabled) {
            return null; // Fall back to rule-based responses
        }
        
        try {
            // Build conversation history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });
            
            // System prompt for Paxi Technologies
            const systemPrompt = `You are a helpful AI assistant for Paxi Technologies, an IT services company serving small and mid-sized businesses.

Your role:
- Help visitors understand our services (IT Support, Project Management, Consulting)
- Answer questions about our company and services
- Guide users to the right service pages or contact form
- Be professional, friendly, and concise
- Always provide actionable next steps

Company Information:
- Services: IT Support, IT Project Management, IT Consulting
- Target: Small and mid-sized businesses
- Specialization: Healthcare IT (but serve all industries)
- Values: Accountability, Plain Language, Structured Delivery, Scalable Approach

Guidelines:
- Keep responses concise (2-3 sentences max)
- Always include a call-to-action or link
- Be helpful but don't oversell
- If unsure, direct to contact form
- Use plain language, avoid jargon`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.conversationHistory.slice(-10), // Last 10 messages for context
                        { role: 'user', content: userMessage }
                    ],
                    temperature: this.temperature,
                    max_tokens: this.maxTokens
                })
            });
            
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });
            
            // Keep history manageable (last 20 messages)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }
            
            return aiResponse;
            
        } catch (error) {
            console.error('AI Chatbot error:', error);
            return null; // Fall back to rule-based
        }
    }
    
    resetConversation() {
        this.conversationHistory = [];
    }
}

// Initialize AI Chatbot
let aiChatbot = null;

function initAIChatbot() {
    if (typeof window !== 'undefined' && window.config && window.config.openai && window.config.openai.apiKey) {
        aiChatbot = new AIChatbot(window.config.openai);
        window.aiChatbot = aiChatbot; // Make available globally
    }
    return aiChatbot;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AIChatbot = AIChatbot;
    window.initAIChatbot = initAIChatbot;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIChatbot, initAIChatbot };
}
