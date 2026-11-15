export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "What size should a Pinterest pin be?",
    answer:
      "The recommended dimension for a standard Pinterest pin is 1000 × 1500 pixels (a 2:3 aspect ratio). Pinterest favors vertical imagery because it fits modern smartphone displays without awkward cropping in search and home feeds. Pins that are taller than 2:3 may be truncated in user feeds, while horizontal images take up significantly less visual real estate.",
  },
  {
    question: "What size is an Instagram post?",
    answer:
      "Instagram supports multiple feed formats: classic square posts are 1080 × 1080 pixels (1:1 ratio), vertical portrait posts are 1080 × 1350 pixels (4:5 ratio), and Stories or Reels are 1080 × 1920 pixels (9:16 ratio). For standard feed posts, portrait (1080 × 1350) is often preferred because it maximizes screen coverage as followers scroll on mobile.",
  },
  {
    question: "How do I resize an image for Etsy?",
    answer:
      "Etsy recommends listing photos that are at least 2000 pixels wide along the shortest side to enable sharp zoom on desktop and mobile. A 2000 × 2000 pixel square image (1:1 ratio) with 'Fit with padding' mode ensures your entire physical product remains visible without any key details being cropped off at the edges.",
  },
  {
    question: "Is Image Resizer free?",
    answer:
      "Yes, Image Resizer is 100% free with no subscriptions, no account sign-up, no hidden fees, and zero watermarks. Built by brand identity designer Abid Mahmud, this utility provides creators, shop owners, and bloggers with instant, professional asset resizing without expensive software like Adobe Photoshop.",
  },
  {
    question: "Are my images uploaded anywhere?",
    answer:
      "No. Your images are processed 100% locally inside your web browser using client-side HTML5 Canvas and WebAssembly. Your photos, private graphics, unpublished product listings, and client media never touch an external server or cloud bucket.",
  },
];
