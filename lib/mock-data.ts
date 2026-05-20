export interface DecorationImage {
  id: string;
  title: string;
  uploadDate: string;
  size: string;
  url: string;
}

export interface SectionData {
  title: string;
  description: string;
  images: DecorationImage[];
}

export const mockImages: Record<string, DecorationImage[]> = {
  haldi: [
    { id: '1', title: 'Marigold Paradise', uploadDate: '2024-01-15', size: '2.3 MB', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80' },
    { id: '2', title: 'Yellow Blossom Stage', uploadDate: '2024-01-14', size: '1.8 MB', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80' },
    { id: '3', title: 'Traditional Setup', uploadDate: '2024-01-13', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80' },
    { id: '4', title: 'Floral Canopy', uploadDate: '2024-01-12', size: '1.5 MB', url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80' },
  ],
  mehendi: [
    { id: '1', title: 'Bohemian Dreams', uploadDate: '2024-01-15', size: '2.5 MB', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
    { id: '2', title: 'Moroccan Nights', uploadDate: '2024-01-14', size: '1.9 MB', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80' },
    { id: '3', title: 'Garden Party', uploadDate: '2024-01-13', size: '2.2 MB', url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&q=80' },
    { id: '4', title: 'Colorful Cushions', uploadDate: '2024-01-12', size: '1.7 MB', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80' },
    { id: '5', title: 'Lantern Magic', uploadDate: '2024-01-11', size: '2.0 MB', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80' },
  ],
  reception: [
    { id: '1', title: 'Crystal Elegance', uploadDate: '2024-01-15', size: '3.1 MB', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' },
    { id: '2', title: 'Romantic Blush', uploadDate: '2024-01-14', size: '2.8 MB', url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80' },
    { id: '3', title: 'Grand Ballroom', uploadDate: '2024-01-13', size: '3.5 MB', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80' },
    { id: '4', title: 'Fairy Tale', uploadDate: '2024-01-12', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&q=80' },
    { id: '5', title: 'Modern Luxe', uploadDate: '2024-01-11', size: '2.9 MB', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
    { id: '6', title: 'Garden Reception', uploadDate: '2024-01-10', size: '2.6 MB', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80' },
  ],
  stage: [
    { id: '1', title: 'Royal Throne', uploadDate: '2024-01-15', size: '3.2 MB', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80' },
    { id: '2', title: 'Floral Paradise', uploadDate: '2024-01-14', size: '2.7 MB', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' },
    { id: '3', title: 'Minimalist Chic', uploadDate: '2024-01-13', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
    { id: '4', title: 'Vintage Romance', uploadDate: '2024-01-12', size: '2.5 MB', url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80' },
    { id: '5', title: 'Contemporary Art', uploadDate: '2024-01-11', size: '2.3 MB', url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&q=80' },
  ],
  entrance: [
    { id: '1', title: 'Grand Archway', uploadDate: '2024-01-15', size: '2.8 MB', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' },
    { id: '2', title: 'Floral Gate', uploadDate: '2024-01-14', size: '2.2 MB', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
    { id: '3', title: 'Welcome Path', uploadDate: '2024-01-13', size: '1.9 MB', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80' },
    { id: '4', title: 'Lantern Walkway', uploadDate: '2024-01-12', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80' },
  ],
  'table-decor': [
    { id: '1', title: 'Elegant Centerpiece', uploadDate: '2024-01-15', size: '1.8 MB', url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80' },
    { id: '2', title: 'Rustic Charm', uploadDate: '2024-01-14', size: '1.6 MB', url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&q=80' },
    { id: '3', title: 'Modern Minimal', uploadDate: '2024-01-13', size: '1.5 MB', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
    { id: '4', title: 'Floral Fantasy', uploadDate: '2024-01-12', size: '2.0 MB', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80' },
    { id: '5', title: 'Candlelit Dream', uploadDate: '2024-01-11', size: '1.7 MB', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80' },
    { id: '6', title: 'Garden Fresh', uploadDate: '2024-01-10', size: '1.9 MB', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80' },
  ],
};

export const sectionDescriptions: Record<string, { title: string; description: string }> = {
  haldi: {
    title: 'Haldi Ceremony',
    description: 'Vibrant yellow-themed decorations for the sacred turmeric ceremony, featuring marigolds, traditional elements, and joyful ambiance.',
  },
  mehendi: {
    title: 'Mehendi Night',
    description: 'Colorful and artistic setups for the mehendi celebration, with cushions, drapes, and enchanting lighting.',
  },
  reception: {
    title: 'Reception',
    description: 'Grand and elegant reception decorations that create unforgettable memories with stunning centerpieces and lighting.',
  },
  wedding: {
    title: 'Wedding',
    description: 'Wedding ceremony and celebration décor imagery.',
  },
  stage: {
    title: 'Stage Décor',
    description: 'Breathtaking stage setups that serve as the perfect backdrop for the couple, featuring flowers, drapes, and artistic elements.',
  },
  entrance: {
    title: 'Entrance Décor',
    description: 'Welcoming entrance decorations that set the tone for the entire celebration with archways, flowers, and lighting.',
  },
  'table-decor': {
    title: 'Table Décor',
    description: 'Exquisite table arrangements and centerpieces that add elegance and charm to every dining experience.',
  },
};

export const dashboardStats = {
  totalImages: 32,
  totalSections: 8,
  storageUsed: '78.5 MB',
};
