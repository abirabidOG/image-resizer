import ImageResizerTool from "../components/ImageResizerTool";
import SeoSection from "../components/SeoSection";
import FaqSection from "../components/FaqSection";
import { FAQS } from "../data/faqs";

export default function Home() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image Resizer — Free Image Resizer for Pinterest, Instagram, Etsy and Blog",
    url: "https://tools.abidmahmud.cv/image-resizer",
    applicationCategory: "DesignApplication",
    operatingSystem: "All (Browser-based)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Get the right image size for Pinterest, Instagram, Etsy and your blog in seconds. Free, no upload, your images never leave your browser. Batch resizing, custom dimensions, Crop to fill or Fit with padding, and ZIP download.",
    browserRequirements:
      "Requires HTML5 Canvas capable browser (Chrome, Safari, Firefox, Edge).",
    author: {
      "@type": "Person",
      name: "Abid Mahmud",
      url: "https://www.abidmahmud.cv",
      jobTitle: "Brand Identity Designer",
    },
  };

  return (
    <div className="space-y-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />

      {/* Main Interactive Tool */}
      <ImageResizerTool />

      {/* SEO Content: Platform Guides & Common Mistakes */}
      <SeoSection />

      {/* FAQ Accordion */}
      <FaqSection />
    </div>
  );
}
