import { useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { pageSeoMap, DEFAULT_SITE_URL } from "@/config/pageSeo";

/** Site-wide structured data: organization identity + site search. */
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Time Is Now",
  alternateName: "TTIN",
  url: DEFAULT_SITE_URL,
  description:
    "A faith-based movement inspiring Christians to live boldly and unashamed of the gospel — free resources, events, merch and teaching.",
  sameAs: [
    "https://instagram.com/_thetimeisnow",
    "https://x.com/thetimeisnow",
    "https://youtube.com/@tthetimeisnow",
  ],
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Time Is Now",
  url: DEFAULT_SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${DEFAULT_SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const RouteSEO = () => {
  const { pathname } = useLocation();
  const meta = pageSeoMap[pathname] || {
    title: "The Time Is Now",
    description: "A faith-based movement inspiring Christians to live boldly.",
  };

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      url={`${DEFAULT_SITE_URL}${pathname}`}
      jsonLd={[ORGANIZATION_JSON_LD, WEBSITE_JSON_LD]}
    />
  );
};

export default RouteSEO;
