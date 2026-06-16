// Dummy project data — shown when the /api/projects endpoint is unavailable.
// Replace or supplement these with real projects via the Admin → Projects panel.

const DUMMY_PROJECTS = [
  {
    id: 'demo-1',
    title: '75" Samsung Frame TV — Living Room Mount',
    location: 'Buckhead, Atlanta, GA',
    description:
      'Full-wall mount installation for a 75-inch Samsung Frame TV with complete in-wall cable concealment and soundbar bracket. Client wanted a gallery-wall look with zero visible wires.',
    services: ['TV Mounting', 'Cable Management'],
    thumbnail:
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&q=80',
      'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=1200&q=80',
    ],
    sort_order: 1,
    featured_landing: true,
  },
  {
    id: 'demo-2',
    title: 'Master Bedroom Drywall Repair & Repaint',
    location: 'Midtown, Atlanta, GA',
    description:
      'Repaired multiple large holes left by a removed shelving system. Matched existing orange-peel texture, primed, and repainted the entire accent wall — completely invisible finish.',
    services: ['Drywall Repair', 'Painting', 'Texture Matching'],
    thumbnail:
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80',
    ],
    sort_order: 2,
    featured_landing: true,
  },
  {
    id: 'demo-3',
    title: 'Full Interior Repaint — 4-Room Home',
    location: 'Sandy Springs, GA',
    description:
      'Complete interior repaint covering living room, dining room, and two bedrooms. Included free color consultation, full surface prep, and two-coat premium low-VOC application.',
    services: ['Painting'],
    thumbnail:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80',
    ],
    sort_order: 3,
    featured_landing: false,
  },
  {
    id: 'demo-4',
    title: 'Custom Built-In Shelving — Home Office',
    location: 'Decatur, GA',
    description:
      'Designed and built a floor-to-ceiling shelving unit for a dedicated home office. Client supplied materials; we handled all measuring, cutting, assembly, and finishing.',
    services: ['Carpentry', 'Custom Shelving'],
    thumbnail:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    ],
    sort_order: 4,
    featured_landing: false,
  },
  {
    id: 'demo-5',
    title: 'Engineered Hardwood Flooring — 3 Bedrooms',
    location: 'Marietta, GA',
    description:
      'Removed old carpet and installed 1,200 sq ft of engineered hardwood across three bedrooms. Included subfloor leveling, underlayment, and coordinated shoe-molding installation.',
    services: ['Flooring'],
    thumbnail:
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1200&q=80',
    ],
    sort_order: 5,
    featured_landing: false,
  },
  {
    id: 'demo-6',
    title: 'Basement Home Theater Build-Out',
    location: 'Alpharetta, GA',
    description:
      "85-inch display wall-mounted with full in-wall wiring, 7.1 surround system, ceiling fan install, new dedicated outlets for all AV equipment, and custom media console carpentry.",
    services: ['TV Mounting', 'Light Electrical', 'Carpentry', 'Cable Management'],
    thumbnail:
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=1200&q=80',
    ],
    sort_order: 6,
    featured_landing: true,
  },
];

export default DUMMY_PROJECTS;
