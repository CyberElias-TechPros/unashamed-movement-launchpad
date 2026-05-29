import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({ 
  title, 
  description, 
  image = "/favicon.ico", 
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "website"
}: SEOProps) => {
  const siteTitle = "The Time Is Now";
  const fullTitle = `${title} | ${siteTitle}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="evangelism, faith, boldness, preaching, Christianity, unashamed" />
      <meta name="author" content="The Time Is Now" />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      <link rel="canonical" href={url} />
    </Helmet>
  );
};