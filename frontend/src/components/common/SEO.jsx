import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
}) {
  const siteName = "Karun Fruits";
  const defaultDescription =
    "Buy premium quality dry fruits, seeds, and healthy snacks online. Almonds, cashews, pistachios, dates and more. Pan India delivery from Mumbai.";
  const defaultImage = "/og-image.jpg";

  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} – Premium Dry Fruits & Healthy Snacks`;
  const metaDesc = description || defaultDescription;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={image || defaultImage} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
}
