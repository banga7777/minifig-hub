import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = 'Minifig Hub - The Definitive LEGO Minifigure Collector Authority',
  description = 'Manage, explore, and grow your complete LEGO Minifigure collection with professional taxonomy, real-time market values, and visual search.',
  image = 'https://minifig-hub.com/og-image.png', // Default OG image
  keywords = 'LEGO, Minifigure, Collection, Tracker, Star Wars, Marvel, DC, Harry Potter, Ninjago, Price Guide, Taxonomy'
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
