import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

const CMS_STORAGE_KEY = 'atltvmountpro_cms_data';

export const DEFAULT_CMS_DATA = {
  home: {
    heroTitle: 'ATL TV Mount PRO',
    heroSubtitle: 'Professional TV Mounting & Handyman Services in Atlanta',
    heroDescription:
      'Expert TV mounting, drywall repair, painting, and handyman services in Atlanta metro area. Same-day service available.',
    featuredServices: [
      {
        title: 'TV Mounting & AV Setup',
        tagline: 'Clean walls. Perfect angles.',
        description:
          'We mount any size TV on any wall type — brick, tile, concrete, or drywall — with full in-wall cable concealment.',
        image: 'https://images.unsplash.com/photo-1698047945367-112339b04d51?w=900&q=80',
        bg: 'from-black/70 via-black/50 to-black/20',
      },
      {
        title: 'Drywall & Painting',
        tagline: 'Flawless finishes, every time.',
        description:
          'Seamless hole repairs with texture matching, full-room priming and painting with colour consultation included.',
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=80',
        bg: 'from-black/70 via-black/50 to-black/20',
      },
      {
        title: 'Carpentry & Custom Shelving',
        tagline: 'Built exactly the way you need it.',
        description:
          'Floating shelves, entertainment centers, trim work, and custom storage built to fit your space perfectly.',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80',
        bg: 'from-black/70 via-black/50 to-black/20',
      },
    ],
    faqs: [
      {
        question: 'What areas do you serve?',
        answer:
          'We serve the Atlanta metro area and throughout Georgia. Contact us to confirm service availability in your specific location.',
      },
      {
        question: 'How much does TV mounting cost?',
        answer:
          'TV mounting starts at $120 and varies based on TV size, wall type, and complexity of cable management. Use our Job Estimator for a detailed breakdown.',
      },
      {
        question: 'Do you offer same-day service?',
        answer:
          'Yes, we offer same-day service with a $40 rush fee, subject to availability. Book early for best availability.',
      },
      {
        question: 'Are you licensed and insured?',
        answer:
          'Yes, we are fully licensed and insured for all services we provide, giving you peace of mind.',
      },
      {
        question: "What's your guarantee?",
        answer:
          "We offer a 100% satisfaction guarantee on all work. If you're not happy, we'll make it right.",
      },
    ],
  },
  about: {
    heroImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1920&q=80',
    heroTitle: 'About ATL TV Mount PRO',
    heroSubtitle: 'Your trusted partner for professional handyman services in Atlanta',
    storyParagraphs: [
      'Founded in 2021, ATL TV Mount PRO started with a simple mission: provide reliable, professional handyman services to the Atlanta community. What began as a TV mounting specialty has grown into a full-service handyman company serving thousands of satisfied customers.',
      'Our team of skilled technicians brings years of experience and a commitment to quality workmanship. We take pride in every project, whether it\'s mounting a TV, repairing drywall, or completing a full room renovation.',
      "We're fully licensed and insured, and we stand behind our work with a 100% satisfaction guarantee. When you choose ATL TV Mount PRO, you're choosing professionalism, reliability, and expertise.",
    ],
    stats: [
      { label: 'Years experience', value: '5+' },
      { label: 'Installations completed', value: '1,000+' },
      { label: 'Satisfaction rate', value: '98.7%' },
      { label: 'Licensed & insured', value: 'Yes' },
    ],
    whyChooseUs: [
      {
        title: 'Professional credentials',
        description: 'Fully licensed and insured for your peace of mind',
      },
      {
        title: 'Same-day service',
        description: 'Available with $40 rush fee, subject to availability',
      },
      {
        title: 'Quality guarantee',
        description: '100% satisfaction guarantee on all work',
      },
    ],
  },
  contact: {
    heroImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80',
    heroTitle: 'Contact Us',
    heroSubtitle: 'Get in touch for a free quote or to schedule your service',
    phone: '770-374-3203',
    serviceArea: 'Atlanta metro area and throughout Georgia',
    hours: 'Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: Closed',
    address: 'Atlanta, GA',
    mapEmbed:
      'https://www.openstreetmap.org/export/embed.html?bbox=-84.4882%2C33.6490%2C-84.2882%2C33.8490&layer=mapnik&marker=33.7490%2C-84.3882',
  },
};

function getLocalCMS() {
  try {
    const stored = localStorage.getItem(CMS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { ...DEFAULT_CMS_DATA };
}

function setLocalCMS(data) {
  localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
}

/**
 * useCMS hook - fetch and manage CMS page data.
 * @param {string} page - 'home' | 'about' | 'contact'
 */
export function useCMS(page) {
  const [data, setData] = useState(() => {
    const local = getLocalCMS();
    return local[page] || DEFAULT_CMS_DATA[page] || {};
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCMS = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('cms_pages').getFirstListItem(`page="${page}"`);
      const parsedData = record?.data || DEFAULT_CMS_DATA[page] || {};
      const allLocal = getLocalCMS();
      allLocal[page] = parsedData;
      setLocalCMS(allLocal);
      setData(parsedData);
    } catch (err) {
      console.warn(`PocketBase CMS fetch failed for "${page}", using localStorage:`, err);
      const local = getLocalCMS();
      setData(local[page] || DEFAULT_CMS_DATA[page] || {});
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  const saveCMS = useCallback(
    async (newData) => {
      try {
        const existing = await pb.collection('cms_pages').getFullList({ filter: `page="${page}"` });
        if (existing.length > 0) {
          await pb.collection('cms_pages').update(existing[0].id, { data: newData });
        } else {
          await pb.collection('cms_pages').create({ page, data: newData });
        }
        const allLocal = getLocalCMS();
        allLocal[page] = newData;
        setLocalCMS(allLocal);
        setData(newData);
        return { success: true };
      } catch (err) {
        console.warn(`PocketBase CMS save failed for "${page}", saving to localStorage:`, err);
        const allLocal = getLocalCMS();
        allLocal[page] = newData;
        setLocalCMS(allLocal);
        setData(newData);
        return { success: true, offline: true };
      }
    },
    [page]
  );

  return { data, loading, error, refetch: fetchCMS, saveCMS };
}

/**
 * Fetch all CMS pages at once (useful for admin).
 */
export function useAllCMS() {
  const [data, setData] = useState(getLocalCMS());
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const records = await pb.collection('cms_pages').getFullList();
      const merged = { ...DEFAULT_CMS_DATA };
      records.forEach((r) => {
        if (r.page && r.data) {
          merged[r.page] = r.data;
        }
      });
      setLocalCMS(merged);
      setData(merged);
    } catch (err) {
      console.warn('PocketBase CMS fetch all failed, using localStorage:', err);
      setData(getLocalCMS());
    } finally {
      setLoading(false);
    }
  }, []);

  const savePage = useCallback(async (page, pageData) => {
    try {
      const existing = await pb.collection('cms_pages').getFullList({ filter: `page="${page}"` });
      if (existing.length > 0) {
        await pb.collection('cms_pages').update(existing[0].id, { data: pageData });
      } else {
        await pb.collection('cms_pages').create({ page, data: pageData });
      }
      const all = getLocalCMS();
      all[page] = pageData;
      setLocalCMS(all);
      setData((prev) => ({ ...prev, [page]: pageData }));
      return { success: true };
    } catch (err) {
      console.warn(`PocketBase CMS save failed for "${page}", saving to localStorage:`, err);
      const all = getLocalCMS();
      all[page] = pageData;
      setLocalCMS(all);
      setData((prev) => ({ ...prev, [page]: pageData }));
      return { success: true, offline: true };
    }
  }, []);

  return { data, loading, fetchAll, savePage };
}
