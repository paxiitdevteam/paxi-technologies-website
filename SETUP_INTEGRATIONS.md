# Integration Setup Guide

## 🔐 Security First - Sensitive Files Protected

All sensitive configuration files are now in `.gitignore`:
- ✅ `config.js` - Your actual API keys and secrets
- ✅ `.env` files - Environment variables
- ✅ `*.key`, `*.pem` - Certificate files
- ✅ Database files
- ✅ Log files with sensitive data

**Important:** Never commit `config.js` with real API keys!

---

## 🚀 Backend API Integration

### Setup Steps:

1. **Create `config.js` from example:**
```bash
cp config.example.js config.js
```

2. **Edit `config.js` and add your API details:**
```javascript
api: {
    baseUrl: 'https://api.paxitechnologies.com', // Your backend URL
    endpoints: {
        chat: '/api/chat/message',
        history: '/api/chat/history',
        contact: '/api/contact/submit',
        analytics: '/api/analytics/track'
    }
}
```

3. **Backend API Endpoints Required:**

#### POST `/api/chat/message`
```json
{
    "message": "user message",
    "context": { "messageCount": 1 },
    "timestamp": "2026-02-04T...",
    "userAgent": "...",
    "page": "/"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "response": "AI or rule-based response",
        "suggestions": ["action1", "action2"]
    }
}
```

#### GET `/api/chat/history/:sessionId`
Returns chat history for a session.

#### POST `/api/contact/submit`
```json
{
    "name": "...",
    "email": "...",
    "subject": "...",
    "message": "..."
}
```

#### POST `/api/analytics/track`
```json
{
    "event": "chat_opened",
    "data": {},
    "timestamp": "...",
    "page": "/"
}
```

---

## 💬 Live Chat Service Integration

### Option 1: Intercom

1. **Get Intercom App ID:**
   - Sign up at https://www.intercom.com
   - Go to Settings > Installation
   - Copy your App ID

2. **Update `config.js`:**
```javascript
liveChat: {
    intercom: {
        appId: 'your-intercom-app-id',
        enabled: true  // Set to true to enable
    }
}
```

3. **Custom chat widget will be hidden automatically**

### Option 2: Drift

1. **Get Drift Account ID:**
   - Sign up at https://www.drift.com
   - Go to Settings > Chat Widget
   - Copy your Account ID

2. **Update `config.js`:**
```javascript
liveChat: {
    drift: {
        accountId: 'your-drift-account-id',
        enabled: true
    }
}
```

### Option 3: Zendesk Chat

1. **Get Zendesk Key:**
   - Sign up at https://www.zendesk.com
   - Go to Settings > Widget
   - Copy your Widget Key

2. **Update `config.js`:**
```javascript
liveChat: {
    zendesk: {
        key: 'your-zendesk-key',
        enabled: true
    }
}
```

---

## 🤖 Advanced AI Features (OpenAI Integration)

### Setup Steps:

1. **Get OpenAI API Key:**
   - Sign up at https://platform.openai.com
   - Go to API Keys section
   - Create a new secret key
   - Copy the key (starts with `sk-`)

2. **Update `config.js`:**
```javascript
openai: {
    apiKey: 'sk-your-actual-api-key-here',
    model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo'
    temperature: 0.7,
    maxTokens: 500
}
```

3. **Features Enabled:**
   - ✅ Intelligent, context-aware responses
   - ✅ Natural language understanding
   - ✅ Conversation history tracking
   - ✅ Fallback to rule-based if API fails

### Cost Considerations:
- `gpt-4o-mini`: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- `gpt-3.5-turbo`: ~$0.50 per 1M input tokens, ~$1.50 per 1M output tokens
- `gpt-4`: Higher cost, better quality

**Recommendation:** Start with `gpt-4o-mini` for cost-effectiveness.

---

## 📊 Analytics Integration

### Google Analytics 4

1. **Get GA4 Tracking ID:**
   - Set up GA4 property at https://analytics.google.com
   - Copy your Measurement ID (G-XXXXXXXXXX)

2. **Update `config.js`:**
```javascript
analytics: {
    googleAnalytics: {
        trackingId: 'G-XXXXXXXXXX',
        enabled: true
    }
}
```

3. **Add to `index.html` (before closing `</head>`):**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 📧 Email Service Integration

### SendGrid Setup

1. **Get SendGrid API Key:**
   - Sign up at https://sendgrid.com
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permissions

2. **Update `config.js`:**
```javascript
email: {
    service: 'sendgrid',
    apiKey: 'SG.your-api-key-here',
    fromEmail: 'noreply@paxitechnologies.com',
    fromName: 'Paxi Technologies'
}
```

### Alternative: Mailchimp

1. **Get Mailchimp API Key:**
   - Sign up at https://mailchimp.com
   - Go to Account > Extras > API Keys
   - Create API Key

2. **Update `config.js`:**
```javascript
email: {
    service: 'mailchimp',
    apiKey: 'your-mailchimp-api-key',
    listId: 'your-list-id',
    fromEmail: 'noreply@paxitechnologies.com'
}
```

---

## 🔄 Integration Priority

### Phase 1 (Recommended First):
1. ✅ Backend API Integration
2. ✅ Analytics (Google Analytics)
3. ✅ Email Service (SendGrid/Mailchimp)

### Phase 2 (Enhanced Features):
4. ✅ Live Chat Service (Intercom/Drift)
5. ✅ AI Chatbot (OpenAI)

### Phase 3 (Optional):
6. Advanced analytics
7. CRM integration
8. Marketing automation

---

## 🛡️ Security Best Practices

1. **Never commit `config.js`** - It's in `.gitignore`
2. **Use environment variables** for production
3. **Rotate API keys** regularly
4. **Use HTTPS** for all API calls
5. **Implement rate limiting** on backend
6. **Validate all inputs** on backend
7. **Use CORS** properly configured

---

## ✅ Testing Checklist

- [ ] Backend API responds correctly
- [ ] Live chat widget appears (if enabled)
- [ ] Custom chat widget hidden when live chat active
- [ ] AI responses work (if OpenAI enabled)
- [ ] Fallback to rule-based works
- [ ] Analytics tracking works
- [ ] Email capture sends to backend
- [ ] Chat history syncs with backend
- [ ] Error handling works gracefully

---

## 📝 Configuration File Template

Copy `config.example.js` to `config.js` and fill in your values. The example file is safe to commit - it has no real secrets.

---

**Need Help?** Check the integration files:
- `js/api-client.js` - Backend API client
- `js/ai-chatbot.js` - OpenAI integration
- `js/live-chat-integration.js` - Live chat services
