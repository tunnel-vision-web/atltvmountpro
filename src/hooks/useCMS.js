import { useState, useEffect, useCallback } from "react";
import pb from "@/lib/pocketbaseClient";

const CMS_STORAGE_KEY = "atltvmountpro_cms_data";

export const DEFAULT_CMS_DATA = {
  home: {
    heroTitle: "Atlanta TV Mount Pro",
    heroSubtitle: "Professional TV Mounting & Handyman Services in Atlanta",
    heroDescription:
      "Expert TV mounting, drywall repair, painting, and handyman services in Atlanta metro area. Same-day service available.",
    featuredServices: [
      {
        title: "TV Mounting & AV Setup",
        tagline: "Clean walls. Perfect angles.",
        description:
          "We mount any size TV on any wall type — brick, tile, concrete, or drywall — with full in-wall cable concealment.",
        image: "https://images.unsplash.com/photo-1698047945367-112339b04d51?w=900&q=80",
        bg: "from-black/70 via-black/50 to-black/20",
      },
      {
        title: "Drywall & Painting",
        tagline: "Flawless finishes, every time.",
        description:
          "Seamless hole repairs with texture matching, full-room priming and painting with colour consultation included.",
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=80",
        bg: "from-black/70 via-black/50 to-black/20",
      },
      {
        title: "Carpentry & Custom Shelving",
        tagline: "Built exactly the way you need it.",
        description:
          "Floating shelves, entertainment centers, trim work, and custom storage built to fit your space perfectly.",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
        bg: "from-black/70 via-black/50 to-black/20",
      },
    ],
    faqs: [
      {
        question: "What areas do you serve?",
        answer:
          "We serve the Atlanta metro area and throughout Georgia. Contact us to confirm service availability in your specific location.",
      },
      {
        question: "How much does TV mounting cost?",
        answer:
          "TV mounting starts at $120 and varies based on TV size, wall type, and complexity of cable management. Use our Job Estimator for a detailed breakdown.",
      },
      {
        question: "Do you offer same-day service?",
        answer:
          "Yes, we offer same-day service with a $40 rush fee, subject to availability. Book early for best availability.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Yes, we are fully licensed and insured for all services we provide, giving you peace of mind.",
      },
      {
        question: "What's your guarantee?",
        answer:
          "We offer a 100% satisfaction guarantee on all work. If you're not happy, we'll make it right.",
      },
    ],
  },
  about: {
    heroImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
    heroTitle: "About Atlanta TV Mount Pro",
    heroSubtitle:
      "Your trusted partner for professional handyman services in Atlanta",
    storyParagraphs: [
      "Founded in 2021, Atlanta TV Mount Pro started with a simple mission: provide reliable, professional handyman services to the Atlanta community. What began as a TV mounting specialty has grown into a full-service handyman company serving thousands of satisfied customers.",
      "Our team of skilled technicians brings years of experience and a commitment to quality workmanship. We take pride in every project, whether it's mounting a TV, repairing drywall, or completing a full room renovation.",
      "We're fully licensed and insured, and we stand behind our work with a 100% satisfaction guarantee. When you choose Atlanta TV Mount Pro, you're choosing professionalism, reliability, and expertise.",
    ],
    stats: [
      { label: "Years experience", value: "5+" },
      { label: "Installations completed", value: "1,000+" },
      { label: "Satisfaction rate", value: "98.7%" },
      { label: "Licensed & insured", value: "Yes" },
    ],
    whyChooseUs: [
      {
        title: "Professional credentials",
        description: "Fully licensed and insured for your peace of mind",
      },
      {
        title: "Same-day service",
        description: "Available with $40 rush fee, subject to availability",
      },
      {
        title: "Quality guarantee",
        description: "100% satisfaction guarantee on all work",
      },
    ],
  },
  contact: {
    heroImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&q=80",
    heroTitle: "Contact Us",
    heroSubtitle: "Get in touch for a free quote or to schedule your service",
    phone: "770-374-3203",
    serviceArea: "Atlanta metro area and throughout Georgia",
    hours: "Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: Closed",
    address: "Atlanta, GA",
    mapEmbed:
      "https://www.openstreetmap.org/export/embed.html?bbox=-84.4882%2C33.6490%2C-84.2882%2C33.8490&layer=mapnik&marker=33.7490%2C-84.3882",
  },
  services: {
    list: [
      {
        id: "svc-1",
        title: "TV Mounting",
        tagline: "Clean walls. Perfect angles.",
        description: "Professional wall mounting for all TV sizes with clean cable management and optimal viewing angles.",
        details: "Our expert technicians handle TVs of all sizes, from compact 32-inch displays to massive 85-inch screens. We ensure optimal viewing angles, secure mounting on any wall type (drywall, brick, concrete), and clean cable management that keeps wires hidden. Every installation includes a level check, stud finder verification, and a final quality inspection.",
        benefits: [
          "All TV sizes supported",
          "Clean cable management",
          "Optimal viewing angles",
          "Secure wall mounting",
          "Same-day service available"
        ],
        image: "https://images.unsplash.com/photo-1698047945367-112339b04d51?w=900&q=80",
        icon: "Tv",
        isCore: true
      },
      {
        id: "svc-2",
        title: "Drywall Repair",
        tagline: "Flawless finishes, every time.",
        description: "Expert patching of holes, crack repairs, smooth finishes, and texture matching for seamless results.",
        details: "From small nail holes to large damaged sections, we repair all types of drywall damage. Our process includes proper patching, sanding, texture matching, and priming. We ensure seamless repairs that blend perfectly with your existing walls, making damage completely invisible.",
        benefits: [
          "Hole patching",
          "Crack repair",
          "Texture matching",
          "Smooth finishes",
          "Paint-ready results"
        ],
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=80",
        icon: "Hammer",
        isCore: true
      },
      {
        id: "svc-3",
        title: "Painting",
        tagline: "Color your world.",
        description: "Interior and exterior painting services with color consultation and thorough prep work included.",
        details: "Transform your space with professional painting services. We handle everything from single rooms to entire homes, both interior and exterior. Our service includes color consultation, thorough surface preparation, quality paint application, and complete cleanup. We use premium paints and ensure clean lines and even coverage.",
        benefits: [
          "Color consultation",
          "Surface preparation",
          "Interior & exterior",
          "Quality materials",
          "Complete cleanup"
        ],
        image: "https://images.unsplash.com/photo-1629195352955-850830e4d6c9?w=900&q=80",
        icon: "Paintbrush",
        isCore: true
      },
      {
        id: "svc-4",
        title: "Carpentry",
        tagline: "Built exactly the way you need it.",
        description: "Custom shelving, trim work, door installation, and professional carpentry repairs.",
        details: "Our skilled carpenters handle custom shelving, trim work, door installation, and repairs. Whether you need built-in storage solutions, crown molding, or door replacements, we deliver precise craftsmanship. Every project is measured carefully and built to last.",
        benefits: [
          "Custom shelving",
          "Trim installation",
          "Door repairs",
          "Built-ins",
          "Precise measurements"
        ],
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
        icon: "Wrench",
        isCore: false
      },
      {
        id: "svc-5",
        title: "Flooring",
        tagline: "Step onto quality.",
        description: "Hardwood, laminate, and tile installation with expert repair services.",
        details: "We install and repair hardwood, laminate, and tile flooring. Our process includes proper subfloor preparation, precise cutting and fitting, and professional finishing. We ensure level surfaces, tight seams, and durable installations that look great and last for years.",
        benefits: [
          "Hardwood installation",
          "Laminate flooring",
          "Tile work",
          "Floor repairs",
          "Subfloor prep"
        ],
        image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=900&q=80",
        icon: "Home",
        isCore: false
      },
      {
        id: "svc-6",
        title: "Plumbing",
        tagline: "Flowing smoothly.",
        description: "Fixture installation, leak repairs, and drain cleaning services.",
        details: "From faucet replacements to toilet installations, we handle common plumbing tasks. Our services include fixture installation, leak repairs, drain cleaning, and minor pipe repairs. We ensure proper connections, test for leaks, and leave your plumbing working perfectly.",
        benefits: [
          "Fixture installation",
          "Leak repairs",
          "Drain cleaning",
          "Faucet replacement",
          "Toilet installation"
        ],
        image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&q=80",
        icon: "Droplet",
        isCore: false
      },
      {
        id: "svc-7",
        title: "Light Electrical",
        tagline: "Powering your comfort.",
        description: "Outlet installation, switch replacement, and light fixture mounting.",
        details: "We handle light electrical work including outlet installation, switch replacement, and light fixture mounting. All work is performed safely and up to code. We test all connections and ensure proper grounding for your safety.",
        benefits: [
          "Outlet installation",
          "Switch replacement",
          "Light fixtures",
          "Code compliant",
          "Safety tested"
        ],
        image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=900&q=80",
        icon: "Zap",
        isCore: false
      }
    ]
  }
};

function getLocalCMS() {
  try {
    const stored = localStorage.getItem(CMS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Clean up legacy broken local paths from storage
      if (parsed.home?.featuredServices?.[0]?.image === "/images/services/service-tv-mounting.jpg") {
        parsed.home.featuredServices[0].image = "https://images.unsplash.com/photo-1698047945367-112339b04d51?w=900&q=80";
      }
      if (parsed.home?.featuredServices?.[1]?.image === "/images/services/service-drywall.jpg") {
        parsed.home.featuredServices[1].image = "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=80";
      }
      if (parsed.home?.featuredServices?.[2]?.image === "/images/services/service-carpentry.jpg") {
        parsed.home.featuredServices[2].image = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80";
      }
      if (parsed.about?.heroImage === "/images/about/about-hero.jpg") {
        parsed.about.heroImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80";
      }
      if (parsed.contact?.heroImage === "/images/pages/page-contact.jpg") {
        parsed.contact.heroImage = "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&q=80";
      }
      // Seed services list if missing
      if (!parsed.services || !parsed.services.list) {
        parsed.services = { ...DEFAULT_CMS_DATA.services };
      }
      return parsed;
    }
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
      const record = await pb
        .collection("cms_pages")
        .getFirstListItem(`page="${page}"`);
      const parsedData = record?.data || DEFAULT_CMS_DATA[page] || {};
      const allLocal = getLocalCMS();
      allLocal[page] = parsedData;
      setLocalCMS(allLocal);
      setData(parsedData);
    } catch (err) {
      console.warn(
        `PocketBase CMS fetch failed for "${page}", using localStorage:`,
        err,
      );
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
        const existing = await pb
          .collection("cms_pages")
          .getFullList({ filter: `page="${page}"` });
        if (existing.length > 0) {
          await pb
            .collection("cms_pages")
            .update(existing[0].id, { data: newData });
        } else {
          await pb.collection("cms_pages").create({ page, data: newData });
        }
        const allLocal = getLocalCMS();
        allLocal[page] = newData;
        setLocalCMS(allLocal);
        setData(newData);
        return { success: true };
      } catch (err) {
        console.warn(
          `PocketBase CMS save failed for "${page}", saving to localStorage:`,
          err,
        );
        const allLocal = getLocalCMS();
        allLocal[page] = newData;
        setLocalCMS(allLocal);
        setData(newData);
        return { success: true, offline: true };
      }
    },
    [page],
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
      const records = await pb.collection("cms_pages").getFullList();
      const merged = { ...DEFAULT_CMS_DATA };
      records.forEach((r) => {
        if (r.page && r.data) {
          merged[r.page] = r.data;
        }
      });
      setLocalCMS(merged);
      setData(merged);
    } catch (err) {
      console.warn("PocketBase CMS fetch all failed, using localStorage:", err);
      setData(getLocalCMS());
    } finally {
      setLoading(false);
    }
  }, []);

  const savePage = useCallback(async (page, pageData) => {
    try {
      const existing = await pb
        .collection("cms_pages")
        .getFullList({ filter: `page="${page}"` });
      if (existing.length > 0) {
        await pb
          .collection("cms_pages")
          .update(existing[0].id, { data: pageData });
      } else {
        await pb.collection("cms_pages").create({ page, data: pageData });
      }
      const all = getLocalCMS();
      all[page] = pageData;
      setLocalCMS(all);
      setData((prev) => ({ ...prev, [page]: pageData }));
      return { success: true };
    } catch (err) {
      console.warn(
        `PocketBase CMS save failed for "${page}", saving to localStorage:`,
        err,
      );
      const all = getLocalCMS();
      all[page] = pageData;
      setLocalCMS(all);
      setData((prev) => ({ ...prev, [page]: pageData }));
      return { success: true, offline: true };
    }
  }, []);

  return { data, loading, fetchAll, savePage };
}
