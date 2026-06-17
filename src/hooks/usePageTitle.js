import { useEffect } from 'react';

const DEFAULT_TITLE = 'Atlanta TV Mount PRO';
const DEFAULT_DESCRIPTION = 'Atlanta TV Mount PRO offers professional TV wall mounting, wire concealment, and expert handyman services in the Atlanta area. Licensed & insured.';
const DEFAULT_KEYWORDS = 'TV mounting Atlanta, TV wall mounting, wire concealment, handyman services Atlanta';

const usePageTitle = (seoInput) => {
  const seo = typeof seoInput === 'string' ? { title: seoInput } : (seoInput || {});
  const serializedDeps = JSON.stringify(seo);

  useEffect(() => {
    // 2. Set title
    const prevTitle = document.title;
    document.title = seo.title || DEFAULT_TITLE;

    // 3. Keep track of tags we create or modify
    const originalMetas = {};
    const createdElements = [];

    const updateMeta = (keyConfig, content) => {
      const { attr, value } = keyConfig;
      const selector = `meta[${attr}="${value}"]`;
      let element = document.head.querySelector(selector);
      
      if (element) {
        // Save original value to restore later
        if (!(selector in originalMetas)) {
          originalMetas[selector] = element.getAttribute('content');
        }
        if (content) {
          element.setAttribute('content', content);
        } else {
          element.removeAttribute('content');
        }
      } else if (content) {
        // Create new element
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        element.setAttribute('content', content);
        document.head.appendChild(element);
        createdElements.push(element);
      }
    };

    // Update metadata
    const desc = seo.description || DEFAULT_DESCRIPTION;
    updateMeta({ attr: 'name', value: 'description' }, desc);
    
    const keywords = seo.keywords || DEFAULT_KEYWORDS;
    updateMeta({ attr: 'name', value: 'keywords' }, keywords);

    // Robots indexing
    if (seo.robots) {
      updateMeta({ attr: 'name', value: 'robots' }, seo.robots);
    } else {
      updateMeta({ attr: 'name', value: 'robots' }, 'index, follow');
    }

    // Open Graph
    updateMeta({ attr: 'property', value: 'og:title' }, seo.ogTitle || seo.title || DEFAULT_TITLE);
    updateMeta({ attr: 'property', value: 'og:description' }, seo.ogDescription || desc);
    updateMeta({ attr: 'property', value: 'og:image' }, seo.ogImage || '/favicon.png');
    updateMeta({ attr: 'property', value: 'og:type' }, seo.ogType || 'website');
    updateMeta({ attr: 'property', value: 'og:url' }, window.location.origin + window.location.pathname);

    // Twitter Cards
    updateMeta({ attr: 'name', value: 'twitter:card' }, 'summary_large_image');
    updateMeta({ attr: 'name', value: 'twitter:title' }, seo.ogTitle || seo.title || DEFAULT_TITLE);
    updateMeta({ attr: 'name', value: 'twitter:description' }, seo.ogDescription || desc);
    updateMeta({ attr: 'name', value: 'twitter:image' }, seo.ogImage || '/favicon.png');

    // Canonical link
    const canonicalSelector = 'link[rel="canonical"]';
    let canonicalLink = document.head.querySelector(canonicalSelector);
    let originalCanonical = null;
    let canonicalCreated = false;
    
    const canonicalHref = window.location.origin + (seo.canonicalPath || window.location.pathname);

    if (canonicalLink) {
      originalCanonical = canonicalLink.getAttribute('href');
      canonicalLink.setAttribute('href', canonicalHref);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalHref);
      document.head.appendChild(canonicalLink);
      canonicalCreated = true;
    }

    // Cleanup on unmount
    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      
      // Restore modified metas
      Object.entries(originalMetas).forEach(([selector, originalContent]) => {
        const el = document.head.querySelector(selector);
        if (el) {
          if (originalContent !== null) {
            el.setAttribute('content', originalContent);
          } else {
            el.removeAttribute('content');
          }
        }
      });

      // Remove created metas
      createdElements.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      // Restore or remove canonical link
      if (canonicalCreated && canonicalLink && canonicalLink.parentNode) {
        canonicalLink.parentNode.removeChild(canonicalLink);
      } else if (canonicalLink && originalCanonical !== null) {
        canonicalLink.setAttribute('href', originalCanonical);
      }
    };
  }, [serializedDeps]);
};

export default usePageTitle;

