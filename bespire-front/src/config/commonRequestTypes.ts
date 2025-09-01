// Configuración de tipos de requests comunes con sus iconos emoji
export interface CommonRequestType {
  id: string;
  name: string;
  icon: string;
  category?: string;
}

export const COMMON_REQUEST_TYPES: CommonRequestType[] = [
  {
    id: "ui-ux",
    name: "UI/UX",
    icon: "💻",
    category: "Design"
  },
  {
    id: "graphic-design",
    name: "Graphic Design",
    icon: "🎨",
    category: "Design"
  },
  {
    id: "mobile-app-development",
    name: "Mobile App Development",
    icon: "📱",
    category: "Development"
  },
  {
    id: "video-editing",
    name: "Video Editing",
    icon: "🎬",
    category: "Media"
  },
  {
    id: "web-development",
    name: "Web Development",
    icon: "🌐",
    category: "Development"
  },
  {
    id: "branding",
    name: "Branding",
    icon: "🏷️",
    category: "Branding"
  },
  {
    id: "content-writing",
    name: "Content Writing",
    icon: "✍️",
    category: "Content"
  },
  {
    id: "seo-optimization",
    name: "SEO Optimization",
    icon: "🔍",
    category: "Marketing"
  },
  {
    id: "social-media",
    name: "Social Media",
    icon: "📲",
    category: "Marketing"
  },
  {
    id: "email-marketing",
    name: "Email Marketing",
    icon: "📧",
    category: "Marketing"
  },
  {
    id: "print-design",
    name: "Print Design",
    icon: "🖨️",
    category: "Branding"
  },
  {
    id: "logo-design",
    name: "Logo Design",
    icon: "🎯",
    category: "Design"
  },
  {
    id: "photography",
    name: "Photography",
    icon: "📸",
    category: "Media"
  },
  {
    id: "animation",
    name: "Animation",
    icon: "🎞️",
    category: "Media"
  },
  {
    id: "copywriting",
    name: "Copywriting",
    icon: "📝",
    category: "Content"
  },
  {
    id: "packaging-design",
    name: "Packaging Design",
    icon: "📦",
    category: "Design"
  },
  {
    id: "presentation-design",
    name: "Presentation Design",
    icon: "📊",
    category: "Design"
  },
  {
    id: "ads-design",
    name: "Ads Design",
    icon: "📢",
    category: "Marketing"
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "📢",
    category: "Marketing"
  },
  {
    id: "blog-design",
    name: "Blog Design",
    icon: "📖",
    category: "Content"
  },
  {
    id: "design-system",
    name: "Design System",
    icon: "🧩",
    category: "Design"
  }
];

// Función helper para encontrar un request type por nombre
export const findRequestTypeByName = (name: string): CommonRequestType | undefined => {
  return COMMON_REQUEST_TYPES.find(
    type => type.name.toLowerCase() === name.toLowerCase()
  );
};

// Función helper para obtener un request type con fallback
export const getRequestTypeWithFallback = (name: string): CommonRequestType => {
  const found = findRequestTypeByName(name);
  return found || {
    id: "other",
    name: name,
    icon: "🔧",
    category: "Other"
  };
};
