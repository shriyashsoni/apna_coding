import { useEffect } from "react";

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export function MetaTags({ title, description, image, url, type = "website" }: MetaTagsProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to set or update meta tags
    const setMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? "name" : "property";
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };

    // Set Open Graph tags
    setMetaTag("og:title", title);
    setMetaTag("og:description", description);
    setMetaTag("og:type", type);
    
    if (image) {
      setMetaTag("og:image", image);
      setMetaTag("og:image:width", "1200");
      setMetaTag("og:image:height", "630");
    }
    
    if (url) {
      setMetaTag("og:url", url);
    }

    // Set Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image", true);
    setMetaTag("twitter:title", title, true);
    setMetaTag("twitter:description", description, true);
    
    if (image) {
      setMetaTag("twitter:image", image, true);
    }

    // Set standard meta tags
    setMetaTag("description", description, true);

    // Cleanup function
    return () => {
      document.title = "Apna Coding";
    };
  }, [title, description, image, url, type]);

  return null;
}
