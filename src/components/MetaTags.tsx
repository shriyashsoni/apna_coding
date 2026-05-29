import { SEO } from "./SEO";

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export function MetaTags({ title, description, image, url, type = "website" }: MetaTagsProps) {
  // Clean dynamic suffix if it was hardcoded in parent components to prevent double templating
  const cleanTitle = title.replace(" | Apna Coding", "").replace(" - Web3 Opportunity Layer", "");

  // Resolve relative urls to absolute paths for canonical validation
  const finalUrl = url && url.startsWith("/") 
    ? url 
    : url && url.includes("window.location.origin")
    ? url.replace("window.location.origin", "")
    : undefined;

  return (
    <SEO
      title={cleanTitle}
      description={description}
      image={image}
      url={finalUrl}
      type={type as any}
    />
  );
}
