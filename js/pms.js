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
            // Remove leading/trailing slashes and filter empty parts
            const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
            const pathParts = cleanPath.split('/').filter(p => p && p !== 'index.html');
            
            // For GitHub Pages project sites: username.github.io/repo-name/
            // The first part of the pathname is the repo name
            if (pathParts.length > 0) {
                this.basePath = '/' + pathParts[0] + '/';
            } else {
                // If we're at the root, check if we can determine repo from URL
                // For project sites, we should have a repo name in the path
                // Fallback: try to get from window.location if available
                this.basePath = '/';
            }
            
            // Debug logging (remove in production if needed)
            console.log('[PMS] GitHub Pages detected. Pathname:', pathname, 'BasePath:', this.basePath);
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
        // Use multiple strategies to ensure paths are fixed
        const fixPaths = () => {
            this.fixAllPaths();
            // Also fix favicon links specifically
            this.fixFaviconPaths();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixPaths);
            // Also run after a short delay to catch any late-loading content
            setTimeout(fixPaths, 100);
        } else {
            // DOM already loaded
            fixPaths();
            // Run again after a short delay
            setTimeout(fixPaths, 100);
        }

        // Watch for dynamically added elements
        this.observeDOMChanges();
    }

    /**
     * Fix favicon paths specifically
     */
    fixFaviconPaths() {
        const basePath = this.getBasePath();
        if (!basePath || basePath === '/') return;

        document.querySelectorAll('link[rel*="icon"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/') && !href.startsWith('http') && !href.startsWith(basePath)) {
                link.href = this.resolve(href);
            }
        });
    }

    /**
     * Observe DOM changes to fix paths in dynamically added content
     */
    observeDOMChanges() {
        const basePath = this.getBasePath();
        if (!basePath || basePath === '/') return; // No need to observe if no path fixing needed

        // Use MutationObserver to watch for new elements
        const observer = new MutationObserver((mutations) => {
            let shouldFix = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    shouldFix = true;
                }
            });
            if (shouldFix) {
                // Debounce the fix operation
                clearTimeout(this._fixTimeout);
                this._fixTimeout = setTimeout(() => {
                    this.fixAllPaths();
                }, 50);
            }
        });

        // Start observing
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            // Wait for body to be available
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
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
        if (!basePath || basePath === '/') {
            console.log('[PMS] No path fixing needed. BasePath:', basePath);
            return;
        }

        // Ensure document.body exists
        if (!document.body) {
            console.log('[PMS] Document body not ready yet');
            return;
        }

        let fixedCount = 0;

        // Fix all img src attributes
        const images = document.querySelectorAll('img[src^="/"]');
        images.forEach(img => {
            const originalSrc = img.getAttribute('src');
            if (originalSrc && 
                !originalSrc.startsWith('http') && 
                !originalSrc.startsWith('data:') &&
                !originalSrc.startsWith(basePath)) {
                const resolved = this.resolve(originalSrc);
                if (resolved !== originalSrc) {
                    img.src = resolved;
                    fixedCount++;
                    console.log('[PMS] Fixed image:', originalSrc, '->', resolved);
                }
            }
        });

        // Fix all link href attributes (navigation, favicons, etc.)
        const links = document.querySelectorAll('a[href^="/"], link[href^="/"]');
        links.forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref && 
                !originalHref.startsWith('http') && 
                !originalHref.startsWith('mailto:') && 
                !originalHref.startsWith('tel:') && 
                !originalHref.startsWith('#') &&
                !originalHref.startsWith('javascript:') &&
                !originalHref.startsWith(basePath)) {
                const resolved = this.resolve(originalHref);
                if (resolved !== originalHref) {
                    link.href = resolved;
                    fixedCount++;
                    console.log('[PMS] Fixed link:', originalHref, '->', resolved);
                }
            }
        });

        // Fix inline styles with url() containing absolute paths
        // Match: url('/path'), url("/path"), url(/path)
        const styleElements = document.querySelectorAll('[style*="url(/"]');
        styleElements.forEach(el => {
            const style = el.getAttribute('style');
            if (style && !style.includes(basePath)) {
                // More comprehensive regex to match url('/path'), url("/path"), url(/path)
                const fixedStyle = style.replace(/url\s*\(\s*(['"]?)(\/[^'")]+)\1\s*\)/g, (match, quote, urlPath) => {
                    if (!urlPath.startsWith(basePath)) {
                        const resolved = this.resolve(urlPath);
                        return `url(${quote}${resolved}${quote})`;
                    }
                    return match;
                });
                if (fixedStyle !== style) {
                    el.setAttribute('style', fixedStyle);
                    fixedCount++;
                    console.log('[PMS] Fixed style URL:', urlPath || 'unknown', '->', this.resolve(urlPath || ''));
                }
            }
        });

        // Fix CSS background-image in style attributes (more comprehensive)
        const bgElements = document.querySelectorAll('[style*="background"]');
        bgElements.forEach(el => {
            const style = el.getAttribute('style');
            if (style && style.includes('url(/') && !style.includes(basePath)) {
                const fixedStyle = style.replace(/url\s*\(\s*(['"]?)(\/[^'")]+)\1\s*\)/g, (match, quote, urlPath) => {
                    if (!urlPath.startsWith(basePath)) {
                        const resolved = this.resolve(urlPath);
                        return `url(${quote}${resolved}${quote})`;
                    }
                    return match;
                });
                if (fixedStyle !== style) {
                    el.setAttribute('style', fixedStyle);
                    fixedCount++;
                    console.log('[PMS] Fixed background URL:', urlPath || 'unknown');
                }
            }
        });

        console.log(`[PMS] Fixed ${fixedCount} paths`);
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
