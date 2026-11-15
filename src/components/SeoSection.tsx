import React from "react";
import {
  Compass,
  Camera,
  ShoppingBag,
  Globe,
  AlertTriangle,
  FileX2,
  EyeOff,
  Gauge,
  CheckCircle2,
} from "lucide-react";

export default function SeoSection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* SECTION 1: H2 Get the right image size for every place you post */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF7F5] px-3 py-1 text-xs font-bold text-[#1F8C7F]">
            <Compass className="h-3.5 w-3.5" />
            <span>Platform Optimization Standards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0B0B0D]">
            Get the right image size for every place you post
          </h2>
          <p className="text-sm sm:text-base text-[#4F4E55] leading-relaxed">
            Every platform prioritizes specific aspect ratios and pixel densities. Upload once, and Image Resizer formats exact, sharp assets for feeds, stories, and storefronts.
          </p>
        </div>

        {/* 4 Cards: Pinterest, Instagram, Etsy, Blog & Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Pinterest */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Pinterest Pins</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              1000 &times; 1500 px (2:3)
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Pinterest feeds favor vertical 2:3 pins. Fits mobile feeds cleanly without clipping headings or truncating product imagery.
            </p>
          </div>

          {/* 2. Instagram */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Instagram Suite</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              1080&times;1080 • 1080&times;1350 • 1080&times;1920
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Export standard square posts, vertical portrait feed posts that take maximum screen height, and full-screen vertical stories.
            </p>
          </div>

          {/* 3. Etsy Listing */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Etsy Listing Photos</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              2000 &times; 2000 px (1:1)
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Etsy recommends minimum 2000px listing photos for high-res zoom. Default &ldquo;Fit with padding&rdquo; prevents cropped edges on handmade goods.
            </p>
          </div>

          {/* 4. Blog & Web */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Blog & Social Previews</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              1200&times;630 • 1200&times;627 • 1280&times;720
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Ideal landscape dimensions for editorial blog hero images, Facebook posts, LinkedIn articles, and YouTube video thumbnails.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: H2 Why the wrong size hurts your posts */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Avoid Common Platform Mistakes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0B0B0D]">
            Why the wrong size hurts your posts
          </h2>
          <p className="text-sm sm:text-base text-[#4F4E55] leading-relaxed">
            Uploading raw, unoptimized camera photos directly to social feeds or storefronts leads to automatic server compression, distorted aspect ratios, and lower engagement.
          </p>
        </div>

        {/* 3 Short Points: Cropped images, Blurry images, Slow pages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Point 1: Cropped images */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <FileX2 className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B0B0D]">
                1. Cropped images
              </h3>
              <p className="text-xs sm:text-sm text-[#4F4E55] leading-relaxed">
                When you post an image with the wrong aspect ratio, social platforms crop it automatically to fit standard containers. Important typography, face shots, and product details get cut off before your audience even clicks.
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E1D6]/60 flex items-center gap-2 text-xs font-semibold text-[#1F8C7F]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Exact platform aspect ratios prevent accidental cropping</span>
            </div>
          </div>

          {/* Point 2: Blurry images */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <EyeOff className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B0B0D]">
                2. Blurry images
              </h3>
              <p className="text-xs sm:text-sm text-[#4F4E55] leading-relaxed">
                Platforms like Instagram and Pinterest recompress huge files aggressively with heavy lossy algorithms. Resizing to the exact recommended canvas before upload keeps lines sharp, colors vibrant, and details crisp.
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E1D6]/60 flex items-center gap-2 text-xs font-semibold text-[#1F8C7F]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>High-DPI Retina scaling preserves fine product details</span>
            </div>
          </div>

          {/* Point 3: Slow pages */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Gauge className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B0B0D]">
                3. Slow pages
              </h3>
              <p className="text-xs sm:text-sm text-[#4F4E55] leading-relaxed">
                Uncut 12 MB camera files destroy website load times and blog Core Web Vitals (LCP). Resizing to tailored 1200px blog dimensions cuts data payload by up to 90%, boosting SEO rankings and user retention.
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E1D6]/60 flex items-center gap-2 text-xs font-semibold text-[#1F8C7F]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Sub-second page speeds improve Google search visibility</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
