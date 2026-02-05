/**
 * Language Manager
 * Handles multi-language support for the website
 */
class LanguageManager {
    constructor() {
        this.currentLang = 'en'; // Default language
        this.translations = {};
        // Only include languages that are actually available and used
        // French can be added later when fr.json is created
        this.supportedLanguages = ['en', 'es']; // French will be added when ready
        this.languageNames = {
            'en': 'English',
            'es': 'Español',
            'fr': 'Français' // Keep for future use
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

        // Load translations FIRST before applying
        await this.loadTranslations();
        
        // Only apply translations if current language translations are loaded
        if (this.translations[this.currentLang]) {
            // Update HTML lang attribute
            const htmlRoot = document.documentElement;
            htmlRoot.lang = this.currentLang;
            if (htmlRoot.id !== 'html-root') {
                htmlRoot.id = 'html-root';
            }
            
            // Apply translations after translations are loaded
            this.applyTranslations();
            
            // Update language switcher if it exists
            this.updateLanguageSwitcher();
            
            console.log(`Language Manager initialized: ${this.currentLang}`);
        } else {
            console.error(`Failed to load translations for ${this.currentLang}, falling back to English`);
            // Fallback to English if current language failed to load
            if (this.translations['en']) {
                this.currentLang = 'en';
                const htmlRoot = document.documentElement;
                htmlRoot.lang = 'en';
                this.applyTranslations();
                this.updateLanguageSwitcher();
                console.log(`Language Manager initialized with fallback: en`);
            }
        }
    }

    /**
     * Load translation files
     */
    async loadTranslations() {
        const basePath = window.PMS ? window.PMS.getBasePath() : '';
        
        // Load all supported languages (only languages that actually exist)
        for (const lang of this.supportedLanguages) {
            try {
                const url = `${basePath}js/languages/${lang}.json`;
                const response = await fetch(url);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                    console.log(`Loaded translations for ${lang} from ${url}`);
                } else {
                    // Only log error for required languages (English)
                    if (lang === 'en') {
                        console.error(`Required translation file for ${lang} not found at ${url} (status: ${response.status})`);
                    } else {
                        console.warn(`Translation file for ${lang} not found at ${url} (status: ${response.status})`);
                    }
                }
            } catch (error) {
                // Only log error for required languages (English)
                if (lang === 'en') {
                    console.error(`Failed to load required translations for ${lang}:`, error);
                } else {
                    // Silent fail for other languages - they're optional
                    console.log(`Translations for ${lang} not available (will be added later)`);
                }
            }
        }
        
        // Verify current language translations are loaded
        if (!this.translations[this.currentLang]) {
            console.warn(`Translations for current language (${this.currentLang}) not loaded, will use English fallback`);
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

        // Check if translations are available for this language
        if (!this.translations[lang]) {
            // Try to load translations if not already loaded
            await this.loadTranslations();
            
            // If still not available, fallback to English
            if (!this.translations[lang]) {
                console.warn(`Translations for ${lang} not available, falling back to English`);
                if (this.translations['en']) {
                    lang = 'en';
                } else {
                    console.error('English translations not available!');
                    return;
                }
            }
        }

        this.currentLang = lang;
        localStorage.setItem('preferred_language', lang);
        document.documentElement.lang = lang;
        
        // Apply translations (only if available)
        if (this.translations[lang]) {
            this.applyTranslations();
        }
        
        // Update language switcher UI
        this.updateLanguageSwitcher();
        
        console.log(`Language changed to: ${lang}`);
    }

    /**
     * Apply translations to elements with data-i18n attribute
     */
    applyTranslations() {
        if (!this.translations[this.currentLang]) {
            console.warn(`Translations for ${this.currentLang} not loaded yet. Skipping translation.`);
            return;
        }
        
        let translatedCount = 0;
        
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Skip if translation is the same as the key (not found)
            if (translation === key && !key.includes('.')) {
                return;
            }
            
            // Handle different element types
            if (element.tagName === 'INPUT') {
                if (element.type === 'text' || element.type === 'email') {
                    if (element.hasAttribute('placeholder')) {
                        element.setAttribute('placeholder', translation);
                    } else {
                        element.value = translation;
                    }
                }
            } else if (element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                }
            } else if (element.tagName === 'LABEL') {
                element.textContent = translation;
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translation);
            } else if (element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', translation);
            } else if (element.hasAttribute('title')) {
                element.setAttribute('title', translation);
            } else {
                element.textContent = translation;
            }
            
            translatedCount++;
        });

        // Translate meta tags
        const title = this.t('meta.title');
        if (title && title !== 'meta.title') {
            document.title = title;
            const metaTitle = document.querySelector('meta[property="og:title"]');
            if (metaTitle) metaTitle.setAttribute('content', title);
        }

        const description = this.t('meta.description');
        if (description && description !== 'meta.description') {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', description);
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', description);
        }
        
        console.log(`Applied translations to ${translatedCount} elements (language: ${this.currentLang})`);
    }

    /**
     * Update language switcher UI
     */
    updateLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (switcher) {
            switcher.value = this.currentLang;
            console.log('Language switcher updated to:', this.currentLang);
        } else {
            console.warn('Language switcher element not found when updating');
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
        // Make LanguageManager globally available immediately (before async init completes)
        window.LanguageManager = langManager;
        langManager.init();
    });
} else {
    const langManager = new LanguageManager();
    // Make LanguageManager globally available immediately (before async init completes)
    window.LanguageManager = langManager;
    langManager.init();
}
