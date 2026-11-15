export type FitMode = "crop" | "pad";

export interface PresetSizeConfig {
  id: string;
  name: string;
  category: "Pinterest" | "Instagram" | "Etsy" | "Blog" | "Social";
  width: number;
  height: number;
  aspectRatio: string;
  fileBaseName: string;
  defaultFitMode: FitMode;
  description: string;
  recommendedUse: string;
}

export const PRESET_SIZES: PresetSizeConfig[] = [
  {
    id: "pinterest-pin",
    name: "Pinterest Pin",
    category: "Pinterest",
    width: 1000,
    height: 1500,
    aspectRatio: "2:3",
    fileBaseName: "image-pinterest-1000x1500",
    defaultFitMode: "crop",
    description: "Standard vertical pin format",
    recommendedUse: "Optimal 2:3 vertical pin format favored by Pinterest search algorithm",
  },
  {
    id: "instagram-post",
    name: "Instagram Post",
    category: "Instagram",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    fileBaseName: "image-instagram-1080x1080",
    defaultFitMode: "crop",
    description: "Classic square feed post",
    recommendedUse: "Square grid feed post with maximum sharpness on Retina mobile screens",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    category: "Instagram",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    fileBaseName: "image-instagram-story-1080x1920",
    defaultFitMode: "crop",
    description: "Full-screen vertical story & reels",
    recommendedUse: "Full-bleed mobile screen coverage for Stories, Reels, and Highlights",
  },
  {
    id: "instagram-portrait",
    name: "Instagram Portrait",
    category: "Instagram",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    fileBaseName: "image-instagram-portrait-1080x1350",
    defaultFitMode: "crop",
    description: "Vertical feed post (maximizes screen space)",
    recommendedUse: "Takes up maximum vertical feed real estate on smartphones without letterboxing",
  },
  {
    id: "etsy-listing",
    name: "Etsy Listing",
    category: "Etsy",
    width: 2000,
    height: 2000,
    aspectRatio: "1:1",
    fileBaseName: "image-etsy-2000x2000",
    defaultFitMode: "pad", // Default: Fit with padding for Etsy as specified
    description: "High-resolution square product listing",
    recommendedUse: "Crisp zoomable product hero photo showing full product without cropped edges",
  },
  {
    id: "blog-featured",
    name: "Blog Featured",
    category: "Blog",
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
    fileBaseName: "image-blog-1200x630",
    defaultFitMode: "crop",
    description: "Editorial blog hero & Open Graph image",
    recommendedUse: "Header banner for WordPress, Webflow, Ghost & universal social link previews",
  },
  {
    id: "facebook-post",
    name: "Facebook Post",
    category: "Social",
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
    fileBaseName: "image-facebook-1200x630",
    defaultFitMode: "crop",
    description: "Landscape feed post & shared link",
    recommendedUse: "Standard Facebook timeline post image and group feed preview",
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    category: "Social",
    width: 1200,
    height: 627,
    aspectRatio: "1.91:1",
    fileBaseName: "image-linkedin-1200x627",
    defaultFitMode: "crop",
    description: "Professional timeline & article image",
    recommendedUse: "Recommended size for LinkedIn company updates, personal posts & pulse articles",
  },
  {
    id: "youtube-thumbnail",
    name: "YouTube Thumbnail",
    category: "Social",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    fileBaseName: "image-youtube-1280x720",
    defaultFitMode: "crop",
    description: "HD 16:9 video cover image",
    recommendedUse: "High-definition video thumbnail that looks crisp across mobile and desktop",
  },
];
