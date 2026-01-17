import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

const SEO = ({
  title = "Dale Jacobs - Product Leader & Design Thinker",
  description = "SaaS Product Leader with 18+ years of experience building and scaling B2B platforms. Skilled in driving growth, defining product strategy, and leading high-performing teams.",
  image = "/og-image.jpg",
  path = "",
}: SEOProps) => {
  const siteUrl = "https://dalejacobs.uk";
  const fullUrl = `${siteUrl}${path}`;
  const fullTitle = title.includes("Dale Jacobs") ? title : `${title} | Dale Jacobs`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dale Jacobs",
    jobTitle: "Product Leader",
    url: siteUrl,
    sameAs: [
      "https://linkedin.com/in/dalepjj",
      "https://bsky.app/profile/dalejacobs.uk",
    ],
    knowsAbout: [
      "Product Management",
      "B2B SaaS",
      "Product Strategy",
      "Design Thinking",
      "AI & Data Strategy",
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${image}`} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
