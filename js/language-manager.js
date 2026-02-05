/**
 * Language Manager
 * Handles multi-language support for the website
 */
class LanguageManager {
    constructor() {
        this.currentLang = 'en'; // Default language
        this.translations = {};
        this.supportedLanguages = ['en', 'es', 'fr']; // French ready for later
        this.languageNames = {
            'en': 'English',
            'es': 'Español',
            'fr': 'Français'
        };
    }

    /**
     * Initialize language manager
     */
    async init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('preferred_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLang = savedLang;
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.supportedLanguages.includes(browserLang)) {
                this.currentLang = browserLang;
            }
        }

        // Load translations
        await this.loadTranslations();
        
        // Apply translations
        this.applyTranslations();
        
        // Update HTML lang attribute
        const htmlRoot = document.documentElement;
        htmlRoot.lang = this.currentLang;
        if (htmlRoot.id !== 'html-root') {
            htmlRoot.id = 'html-root';
        }
        
        // Make LanguageManager globally available
        window.LanguageManager = this;
        
        console.log(`Language Manager initialized: ${this.currentLang}`);
    }

    /**
     * Load translation files
     */
    async loadTranslations() {
        const basePath = window.PMS ? window.PMS.getBasePath() : '';
        
        for (const lang of this.supportedLanguages) {
            try {
                const response = await fetch(`${basePath}js/languages/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                } else {
                    console.warn(`Translation file for ${lang} not found`);
                }
            } catch (error) {
                console.warn(`Failed to load translations for ${lang}:`, error);
            }
        }
    }

    /**
     * Get translation for a key
     */
    t(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if translation not found
                if (this.currentLang !== 'en') {
                    value = this.translations['en'];
                    for (const k2 of keys) {
                        if (value && typeof value === 'object' && k2 in value) {
                            value = value[k2];
                        } else {
                            return defaultValue || key;
                        }
                    }
                } else {
                    return defaultValue || key;
                }
            }
        }
        
        return value || defaultValue || key;
    }

    /**
     * Change language
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language ${lang} is not supported`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('preferred_language', lang);
        document.documentElement.lang = lang;
        
        // Reload translations if not already loaded
        if (!this.translations[lang]) {
            await this.loadTranslations();
        }
        
        // Apply translations
        this.applyTranslations();
        
        // Update language switcher UI
        this.updateLanguageSwitcher();
        
        console.log(`Language changed to: ${lang}`);
    }

    /**
     * Apply translations to elements with data-i18n attribute
     */
    applyTranslations() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translation);
            } else if (element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', translation);
            } else if (element.hasAttribute('title')) {
                element.setAttribute('title', translation);
            } else {
                element.textContent = translation;
            }
        });

        // Translate meta tags
        const title = this.t('meta.title');
        if (title) {
            document.title = title;
            const metaTitle = document.querySelector('meta[property="og:title"]');
            if (metaTitle) metaTitle.setAttribute('content', title);
        }

        const description = this.t('meta.description');
        if (description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', description);
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', description);
        }
    }

    /**
     * Update language switcher UI
     */
    updateLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (switcher) {
            switcher.value = this.currentLang;
        }
        
        // Update language option labels
        document.querySelectorAll('[data-lang]').forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get language name
     */
    getLanguageName(lang) {
        return this.languageNames[lang] || lang;
    }
}

// Initialize language manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const langManager = new LanguageManager();
        langManager.init();
    });
} else {
    const langManager = new LanguageManager();
    langManager.init();
}
