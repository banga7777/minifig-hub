
export const slugify = (text: string) => {
  if (!text) return '';
  // Decode HTML entities first if any
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  const decodedText = textArea.value;

  return decodedText
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')        // Trim - from start of text
    .replace(/-+$/, '');       // Trim - from end of text
};

export const getMinifigUrl = (id: string, name?: string) => {
  if (!name) return `/minifigure/${id}`;
  return `/minifigure/${id}/${slugify(name)}`;
};

export const getThemeUrl = (themeName: string) => {
  return `/theme/${slugify(themeName)}`;
};

/**
 * Updates the canonical link tag in the document head.
 */
export const updateCanonical = (path: string) => {
  let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  const baseUrl = 'https://minifig-hub.com';
  link.href = `${baseUrl}${path}`;
};

export const updateMetaTags = (title: string, description: string, path: string) => {
  document.title = title;
  
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);

  updateCanonical(path);
};

export const setNoIndex = (shouldNoIndex: boolean) => {
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (shouldNoIndex) {
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
  } else {
    if (metaRobots) {
      metaRobots.remove();
    }
  }
};
