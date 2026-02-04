/**
 * PMS (Path Management System)
 * Centralized path resolution for the entire website
 * Handles all path resolution automatically, eliminating manual path fixes
 */

class PathManagementSystem {
    constructor() {
        this.basePath = '';
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialize PMS - detects environment and sets base path
     */
    init() {
        if (this.isInitialized) return;

        const hostname = window.location.hostname;
        const isGitHubPages = hostname.includes('github.io');
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

        if (isGitHubPages) {
            // GitHub Pages: extract repository name from pathname
            const pathname = window.location.pathname;
            const pathParts = pathname.split('/').filter(p => p && p !== 'index.html');
            
            if (pathParts.length > 0) {
                this.basePath = '/' + pathParts[0] + '/';
            } else {
                this.basePath = '/';
            }
        } else if (isLocalhost) {
            // Local development: use relative paths based on current directory depth
            const path = window.location.pathname;
            const parts = path.split('/').filter(p => p && p !== 'index.html' && p !== '');
            const depth = parts.length;
            this.basePath = depth > 0 ? '../'.repeat(depth) : '';
        } else {
            // Production or other environments: assume root
            this.basePath = '';
        }

        // Store globally for access
        window.__PMS_BASE_PATH__ = this.basePath;
        this.isInitialized = true;

        // Auto-fix all paths in the document when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.fixAllPaths());
        } else {
            // DOM already loaded
            this.fixAllPaths();
        }
    }

    /**
     * Get the base path for the current environment
     * @returns {string} Base path
     */
    getBasePath() {
        if (!this.isInitialized) {
            this.init();
        }
        return this.basePath;
    }

    /**
     * Resolve a path relative to the base path
     * @param {string} path - Path to resolve (can be absolute starting with / or relative)
     * @returns {string} Resolved path
     */
    resolve(path) {
        const basePath = this.getBasePath();

        // If path is already absolute with base path, return as-is
        if (path.startsWith(basePath)) {
            return path;
        }

        // If path starts with /, it's an absolute path from root
        if (path.startsWith('/')) {
            // For GitHub Pages, prepend base path
            if (basePath && basePath !== '/' && basePath !== '') {
                return basePath + path.substring(1);
            }
            return path;
        }

        // Relative path - return as-is (browser will resolve relative to current page)
        return path;
    }

    /**
     * Fix all absolute paths in the document
     * This is called automatically on initialization
     */
    fixAllPaths() {
        const basePath = this.getBasePath();
        
        // Skip if no base path adjustment needed
        if (!basePath || basePath === '/') return;

        // Fix all img src attributes
        document.querySelectorAll('img[src^="/"]').forEach(img => {
            const originalSrc = img.getAttribute('src');
            if (originalSrc && !originalSrc.startsWith('http') && !originalSrc.startsWith(basePath)) {
                img.src = this.resolve(originalSrc);
            }
        });

        // Fix all link href attributes (navigation, favicons, etc.)
        document.querySelectorAll('a[href^="/"], link[href^="/"]').forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref && 
                !originalHref.startsWith('http') && 
                !originalHref.startsWith('mailto:') && 
                !originalHref.startsWith('tel:') && 
                !originalHref.startsWith('#') &&
                !originalHref.startsWith(basePath)) {
                link.href = this.resolve(originalHref);
            }
        });

        // Fix inline styles with url() containing absolute paths
        document.querySelectorAll('[style*="url(/"]').forEach(el => {
            const style = el.getAttribute('style');
            if (style && !style.includes(basePath)) {
                const fixedStyle = style.replace(/url\((\/)/g, (match, p1) => {
                    return `url(${this.resolve(p1)}`;
                });
                el.setAttribute('style', fixedStyle);
            }
        });

        // Fix CSS background-image in style attributes
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
            const style = el.getAttribute('style');
            if (style && style.includes('url(/') && !style.includes(basePath)) {
                const fixedStyle = style.replace(/url\((\/[^)]+)\)/g, (match, urlPath) => {
                    return `url(${this.resolve(urlPath)})`;
                });
                el.setAttribute('style', fixedStyle);
            }
        });
    }

    /**
     * Fix paths in dynamically loaded content
     * Call this after inserting HTML into the DOM
     * @param {HTMLElement} container - Container element with new content
     */
    fixPathsInContainer(container) {
        const basePath = this.getBasePath();
        if (!basePath || basePath === '/') return;

        // Fix images
        container.querySelectorAll('img[src^="/"]').forEach(img => {
            const originalSrc = img.getAttribute('src');
            if (originalSrc && !originalSrc.startsWith('http') && !originalSrc.startsWith(basePath)) {
                img.src = this.resolve(originalSrc);
            }
        });

        // Fix links
        container.querySelectorAll('a[href^="/"], link[href^="/"]').forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref && 
                !originalHref.startsWith('http') && 
                !originalHref.startsWith('mailto:') && 
                !originalHref.startsWith('tel:') && 
                !originalHref.startsWith('#') &&
                !originalHref.startsWith(basePath)) {
                link.href = this.resolve(originalHref);
            }
        });

        // Fix inline styles
        container.querySelectorAll('[style*="url(/"]').forEach(el => {
            const style = el.getAttribute('style');
            if (style && !style.includes(basePath)) {
                const fixedStyle = style.replace(/url\((\/)/g, (match, p1) => {
                    return `url(${this.resolve(p1)}`;
                });
                el.setAttribute('style', fixedStyle);
            }
        });
    }

    /**
     * Get component path (for loading header, footer, etc.)
     * @param {string} componentName - Component name (e.g., 'header.html')
     * @returns {string} Full path to component
     */
    getComponentPath(componentName) {
        return this.resolve(`/components/${componentName}`);
    }

    /**
     * Get asset path (for images, icons, etc.)
     * @param {string} assetPath - Asset path (e.g., '/media/images/hero.jpg')
     * @returns {string} Full path to asset
     */
    getAssetPath(assetPath) {
        return this.resolve(assetPath);
    }
}

// Initialize PMS immediately
const PMS = new PathManagementSystem();

// Make PMS globally available
window.PMS = PMS;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PMS;
}
