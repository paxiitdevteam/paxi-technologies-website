# Paxi Technologies Website

Official website for Paxi Technologies - IT services for small and mid-sized businesses.

## 🚀 Features

- **Modern, Responsive Design** - Works beautifully on all devices
- **Three Service Pages** - IT Support, Project Management, and Consulting
- **Interactive Chat Widget** - AI-powered chatbot to help visitors
- **Statistics Dashboard** - Animated metrics and impact visualization
- **Legal Pages** - Privacy Policy, Terms of Service, Cookie Policy
- **Cookie Consent** - GDPR-compliant cookie management
- **Smooth Animations** - Scroll animations and transitions
- **SEO Optimized** - Meta tags, semantic HTML, clean URLs

## 📁 Project Structure

```
├── index.html                 # Homepage
├── about/                     # About page
├── contact/                   # Contact page
├── services/                  # Service pages
│   ├── it-support/
│   ├── it-project-management/
│   └── it-consulting/
├── privacy-policy/           # Legal pages
├── terms-of-service/
├── cookie-policy/
├── components/                # Reusable components
│   ├── header.html
│   ├── footer.html
│   └── chat-widget.html
├── media/                     # Assets
│   ├── images/
│   ├── icons/
│   └── favicons/
├── styles.css                 # Main stylesheet
├── script.js                  # JavaScript functionality
└── server.py                  # Development server
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript** - Vanilla JS (no frameworks)
- **Python** - Simple HTTP server for development

## 🚀 Getting Started

### Prerequisites

- Python 3.x
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/paxi-technologies-website.git
cd paxi-technologies-website
```

2. Start the development server:
```bash
python server.py
```

3. Open your browser:
```
http://localhost:3000
```

### Alternative: Using start scripts

**Windows:**
```bash
start-server.bat
```

**Linux/Mac:**
```bash
./start-server.sh
```

## 📝 Development

### File Structure
- All pages use `index.html` in subdirectories for clean URLs
- Components are loaded dynamically via JavaScript
- Styles are centralized in `styles.css`
- Scripts are in `script.js`

### Adding New Pages
1. Create a new directory: `new-page/`
2. Add `index.html` inside
3. Include header/footer placeholders
4. Link in navigation

### Styling
- CSS variables defined in `:root` for easy theming
- Responsive design with mobile-first approach
- Component-based CSS organization

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #264653;
    --secondary-color: #2a9d8f;
    --accent-yellow: #e9c46a;
    /* ... */
}
```

### Images
Replace placeholder images in `media/images/` with your actual photos. See `media/images/IMAGE_CHECKLIST.md` for requirements.

### Content
Edit HTML files directly. All content is in plain HTML.

## 📦 Deployment

### Static Hosting Options
- **GitHub Pages** - Free hosting
- **Netlify** - Easy deployment
- **Vercel** - Fast static hosting
- **AWS S3** - Scalable hosting
- **Traditional Web Hosting** - Upload files via FTP

### GitHub Pages Setup
1. Push code to GitHub
2. Go to repository Settings > Pages
3. Select branch (usually `main`)
4. Your site will be live at `https://YOUR_USERNAME.github.io/paxi-technologies-website/`

## 🔧 Features in Detail

### Chat Widget
- AI-powered responses
- Email capture
- Chat history persistence
- Analytics tracking
- Direct links to service pages

### Statistics Section
- Animated counters
- Card-style presentation
- Responsive grid layout
- Auto-triggers on scroll

### Animations
- Scroll-triggered fade-ins
- Smooth scrolling
- Hover effects
- Loading states

## 📄 License

Copyright © 2026 Paxi Technologies. All rights reserved.

## 🤝 Contributing

This is a private project for Paxi Technologies. For questions or suggestions, please contact the development team.

## 📞 Contact

- **Website**: [paxitechnologies.com](https://www.paxitechnologies.com)
- **Email**: info@paxitechnologies.com
- **Phone**: +1 (234) 567-890

---

**Built with ❤️ for Paxi Technologies**
